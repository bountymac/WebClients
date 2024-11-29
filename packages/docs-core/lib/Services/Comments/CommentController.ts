import type {
  AnyCommentMessageData,
  CommentControllerInterface,
  CommentThreadInterface,
  CommentInterface,
  InternalEventHandlerInterface,
  InternalEventInterface,
  InternalEventBusInterface,
  CommentMarkNodeChangeData,
  SuggestionThreadStateAction,
  SuggestionSummaryType,
} from '@proton/docs-shared'
import {
  CommentsMessageType,
  CommentsEvent,
  BroadcastSource,
  CommentThreadState,
  CommentType,
} from '@proton/docs-shared'
import type { EncryptComment } from '../../UseCase/EncryptComment'
import type { LoggerInterface } from '@proton/utils/logs'
import { CreateRealtimeCommentPayload } from './CreateRealtimeCommentPayload'
import { LocalCommentsState } from './LocalCommentsState'
import type { HandleRealtimeCommentsEvent } from '../../UseCase/HandleRealtimeCommentsEvent'
import type { CreateThread } from '../../UseCase/CreateThread'
import type { CreateComment } from '../../UseCase/CreateComment'
import type { LoadThreads } from '../../UseCase/LoadThreads'
import { LiveComments } from '../../Realtime/LiveComments/LiveComments'
import type { WebsocketServiceInterface } from '../Websockets/WebsocketServiceInterface'
import type { DocControllerEventPayloads } from '../../AuthenticatedDocController/AuthenticatedDocControllerEvent'
import { DocControllerEvent } from '../../AuthenticatedDocController/AuthenticatedDocControllerEvent'
import metrics from '@proton/metrics'
import { EventTypeEnum } from '@proton/docs-proto'
import type { DocsApi } from '../../Api/DocsApi'
import { CommentThreadType } from '@proton/docs-shared'
import { WebsocketConnectionEvent } from '../../Realtime/WebsocketEvent/WebsocketConnectionEvent'
import type { MetricService } from '../Metrics/MetricService'
import { TelemetryDocsEvents } from '@proton/shared/lib/api/telemetry'
import type { DocumentState } from '../../State/DocumentState'
import type { UserState } from '../../State/UserState'

/**
 * Controls comments for a single document.
 */
export class CommentController implements CommentControllerInterface, InternalEventHandlerInterface {
  private localCommentsState: LocalCommentsState

  public readonly liveComments: LiveComments = new LiveComments(
    this.websocketService,
    this.documentState.getProperty('documentMeta').nodeMeta,
    this.documentState.getProperty('entitlements').keys.userOwnAddress,
    this.eventBus,
    this.logger,
  )

  shouldSendDocumentName = false

  constructor(
    private userState: UserState,
    private documentState: DocumentState,
    private readonly websocketService: WebsocketServiceInterface,
    private readonly metricService: MetricService,
    private api: DocsApi,
    private _encryptComment: EncryptComment,
    private _createThread: CreateThread,
    private _createComment: CreateComment,
    private _loadThreads: LoadThreads,
    private _handleRealtimeEvent: HandleRealtimeCommentsEvent,
    public readonly eventBus: InternalEventBusInterface,
    private logger: LoggerInterface,
  ) {
    this.localCommentsState = new LocalCommentsState(eventBus)
    eventBus.addEventHandler(this, DocControllerEvent.RealtimeCommentMessageReceived)
    eventBus.addEventHandler(this, WebsocketConnectionEvent.ConnectionEstablishedButNotYetReady)

    this.userState.subscribe((state) => {
      this.shouldSendDocumentName = state.currentDocumentEmailDocTitleEnabled ?? false
    })
  }

  get userDisplayName(): string {
    return this.documentState.getProperty('entitlements').keys.userOwnAddress
  }

  public fetchAllComments(): void {
    void this._loadThreads.execute({
      lookup: this.documentState.getProperty('documentMeta').nodeMeta,
      keys: this.documentState.getProperty('entitlements').keys,
      commentsState: this.localCommentsState,
    })
  }

  private broadcastCommentMessage(type: CommentsMessageType, dto: AnyCommentMessageData): void {
    const data = CreateRealtimeCommentPayload(type, dto)

    void this.websocketService.sendEventMessage(
      this.documentState.getProperty('documentMeta').nodeMeta,
      data,
      EventTypeEnum.ClientHasSentACommentMessage,
      BroadcastSource.CommentsController,
    )

    if ([CommentsMessageType.AddThread, CommentsMessageType.AddComment].includes(type)) {
      metrics.docs_comments_total.increment({
        type: CommentsMessageType.AddThread === type ? 'comment' : 'reply',
      })
    }
  }

  public getTypersExcludingSelf(threadId: string): string[] {
    return this.liveComments
      .getTypingUsers(threadId)
      .filter((user) => user !== this.documentState.getProperty('entitlements').keys.userOwnAddress)
  }

  public beganTypingInThread(threadID: string): void {
    this.liveComments.setIsTypingComment(threadID, true)
  }

  public stoppedTypingInThread(threadID: string): void {
    this.liveComments.setIsTypingComment(threadID, false)
  }

  async handleEvent(event: InternalEventInterface): Promise<void> {
    if (event.type === WebsocketConnectionEvent.ConnectionEstablishedButNotYetReady) {
      void this.fetchAllComments()
    } else if (event.type === DocControllerEvent.RealtimeCommentMessageReceived) {
      const { message } = event.payload as DocControllerEventPayloads[DocControllerEvent.RealtimeCommentMessageReceived]

      this._handleRealtimeEvent.execute(this.localCommentsState, this.liveComments, message)
    }
  }

  getAllThreads(): CommentThreadInterface[] {
    return this.localCommentsState.getAllThreads()
  }

  async createCommentThread(
    commentContent: string,
    markID?: string,
    createMarkNode = true,
  ): Promise<CommentThreadInterface | undefined> {
    const decryptedDocumentName = this.shouldSendDocumentName ? this.documentState.getProperty('documentName') : null

    const threadResult = await this._createThread.execute({
      text: commentContent,
      keys: this.documentState.getProperty('entitlements').keys,
      lookup: this.documentState.getProperty('documentMeta').nodeMeta,
      commentsState: this.localCommentsState,
      markID,
      createMarkNode,
      type: CommentThreadType.Comment,
      decryptedDocumentName,
    })

    if (threadResult.isFailed()) {
      this.logger.error(threadResult.getError())
      return undefined
    }

    const thread = threadResult.getValue()

    this.broadcastCommentMessage(CommentsMessageType.AddThread, thread.asPayload())

    return thread
  }

  async createSuggestionThread(
    suggestionID: string,
    commentContent: string,
    suggestionType: SuggestionSummaryType,
  ): Promise<CommentThreadInterface | undefined> {
    const decryptedDocumentName = this.shouldSendDocumentName ? this.documentState.getProperty('documentName') : null

    const threadResult = await this._createThread.execute({
      text: commentContent,
      keys: this.documentState.getProperty('entitlements').keys,
      lookup: this.documentState.getProperty('documentMeta').nodeMeta,
      commentsState: this.localCommentsState,
      markID: suggestionID,
      createMarkNode: false,
      type: CommentThreadType.Suggestion,
      decryptedDocumentName,
    })

    if (threadResult.isFailed()) {
      this.logger.error(threadResult.getError())
      return undefined
    }

    const thread = threadResult.getValue()

    this.broadcastCommentMessage(CommentsMessageType.AddThread, thread.asPayload())

    this.metricService.reportSuggestionsTelemetry(TelemetryDocsEvents.suggestion_created)
    this.metricService.reportSuggestionCreated(suggestionType)

    return thread
  }

  async createComment(content: string, threadID: string): Promise<CommentInterface | undefined> {
    const decryptedDocumentName = this.shouldSendDocumentName ? this.documentState.getProperty('documentName') : null

    const commentResult = await this._createComment.execute({
      text: content,
      threadID,
      keys: this.documentState.getProperty('entitlements').keys,
      lookup: this.documentState.getProperty('documentMeta').nodeMeta,
      commentsState: this.localCommentsState,
      type: CommentType.Comment,
      decryptedDocumentName,
    })

    if (commentResult.isFailed()) {
      this.logger.error(commentResult.getError())
      return undefined
    }

    const thread = this.localCommentsState.findThreadById(threadID)
    if (thread && thread.type === CommentThreadType.Suggestion) {
      this.metricService.reportSuggestionsTelemetry(TelemetryDocsEvents.suggestion_commented)
    }

    const comment = commentResult.getValue()

    this.broadcastCommentMessage(CommentsMessageType.AddComment, { comment: comment.asPayload(), threadID })

    return comment
  }

  async createSuggestionSummaryComment(content: string, threadID: string): Promise<CommentInterface | undefined> {
    const decryptedDocumentName = this.shouldSendDocumentName ? this.documentState.getProperty('documentName') : null

    const commentResult = await this._createComment.execute({
      text: content,
      threadID,
      keys: this.documentState.getProperty('entitlements').keys,
      lookup: this.documentState.getProperty('documentMeta').nodeMeta,
      commentsState: this.localCommentsState,
      type: CommentType.Suggestion,
      decryptedDocumentName,
    })

    if (commentResult.isFailed()) {
      this.logger.error(commentResult.getError())
      return undefined
    }

    const thread = this.localCommentsState.findThreadById(threadID)
    if (thread && thread.type === CommentThreadType.Suggestion) {
      this.metricService.reportSuggestionsTelemetry(TelemetryDocsEvents.suggestion_commented)
    }

    const comment = commentResult.getValue()

    this.broadcastCommentMessage(CommentsMessageType.AddComment, { comment: comment.asPayload(), threadID })

    return comment
  }

  async editComment(threadID: string, commentID: string, content: string): Promise<boolean> {
    const thread = this.localCommentsState.findThreadById(threadID)
    if (!thread) {
      throw new Error('Thread not found')
    }

    const encryptionResult = await this._encryptComment.execute(
      content,
      thread.markID,
      this.documentState.getProperty('entitlements').keys,
    )
    if (encryptionResult.isFailed()) {
      return false
    }

    const encryptedContent = encryptionResult.getValue()

    const nodeMeta = this.documentState.getProperty('documentMeta').nodeMeta

    const result = await this.api.editComment({
      volumeId: nodeMeta.volumeId,
      linkId: nodeMeta.linkId,
      threadId: threadID,
      commentId: commentID,
      encryptedContent: encryptedContent,
      authorEmail: this.documentState.getProperty('entitlements').keys.userOwnAddress,
    })
    if (result.isFailed()) {
      return false
    }

    this.localCommentsState.editComment({ commentID, threadID, content })

    this.broadcastCommentMessage(CommentsMessageType.EditComment, { commentID, threadID, content })

    return true
  }

  async deleteThread(id: string): Promise<boolean> {
    const nodeMeta = this.documentState.getProperty('documentMeta').nodeMeta

    const response = await this.api.deleteThread(nodeMeta.volumeId, nodeMeta.linkId, id)
    if (response.isFailed()) {
      return false
    }

    this.localCommentsState.deleteThread(id)

    this.broadcastCommentMessage(CommentsMessageType.DeleteThread, { threadId: id })

    return true
  }

  async deleteComment(threadID: string, commentID: string): Promise<boolean> {
    const nodeMeta = this.documentState.getProperty('documentMeta').nodeMeta

    const response = await this.api.deleteComment(nodeMeta.volumeId, nodeMeta.linkId, threadID, commentID)
    if (response.isFailed()) {
      return false
    }

    this.localCommentsState.deleteComment({ commentID, threadID })

    this.broadcastCommentMessage(CommentsMessageType.DeleteComment, { commentID, threadID })

    return true
  }

  async resolveThread(threadId: string): Promise<boolean> {
    const nodeMeta = this.documentState.getProperty('documentMeta').nodeMeta

    const response = await this.api.resolveThread(nodeMeta.volumeId, nodeMeta.linkId, threadId)
    if (response.isFailed()) {
      return false
    }

    const resolvedThread = this.localCommentsState.resolveThread(threadId)
    if (!resolvedThread) {
      return false
    }

    this.eventBus.publish<CommentMarkNodeChangeData>({
      type: CommentsEvent.ResolveMarkNode,
      payload: {
        markID: resolvedThread.markID,
      },
    })

    this.broadcastCommentMessage(CommentsMessageType.ResolveThread, { threadId })

    return true
  }

  async unresolveThread(threadId: string): Promise<boolean> {
    const nodeMeta = this.documentState.getProperty('documentMeta').nodeMeta

    const response = await this.api.unresolveThread(nodeMeta.volumeId, nodeMeta.linkId, threadId)
    if (response.isFailed()) {
      return false
    }

    const unresolvedThread = this.localCommentsState.unresolveThread(threadId)
    if (!unresolvedThread) {
      return false
    }

    this.eventBus.publish<CommentMarkNodeChangeData>({
      type: CommentsEvent.UnresolveMarkNode,
      payload: {
        markID: unresolvedThread.markID,
      },
    })

    this.broadcastCommentMessage(CommentsMessageType.UnresolveThread, { threadId })

    return true
  }

  async changeSuggestionThreadState(
    threadId: string,
    action: SuggestionThreadStateAction,
    summary?: string,
  ): Promise<boolean> {
    if (summary) {
      const comment = await this.createSuggestionSummaryComment(summary, threadId)
      if (!comment) {
        return false
      }
    }

    const nodeMeta = this.documentState.getProperty('documentMeta').nodeMeta

    const response = await this.api.changeSuggestionThreadState(nodeMeta.volumeId, nodeMeta.linkId, threadId, action)
    if (response.isFailed()) {
      return false
    }

    let state = CommentThreadState.Active
    if (action === 'accept') {
      state = CommentThreadState.Accepted
    } else if (action === 'reject') {
      state = CommentThreadState.Rejected
    }

    const thread = this.localCommentsState.changeThreadState(threadId, state)
    if (!thread) {
      return false
    }

    if (state === CommentThreadState.Accepted || state === CommentThreadState.Rejected) {
      this.metricService.reportSuggestionsTelemetry(TelemetryDocsEvents.suggestion_resolved)
      this.metricService.reportSuggestionResolved(state === CommentThreadState.Accepted ? 'accepted' : 'rejected')
    }

    return true
  }

  markThreadAsRead(id: string): void {
    this.localCommentsState.markThreadAsRead(id)
  }
}
