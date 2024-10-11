import { $isListItemNode, $isListNode } from '@lexical/list'
import type { ElementNode } from 'lexical'
import { $nodesOfType, $isElementNode, $isTextNode } from 'lexical'
import { $unwrapSuggestionNode } from './Utils'
import { ProtonNode, $isSuggestionNode } from './ProtonNode'
import { $createLinkNode, $isLinkNode } from '@lexical/link'
import { $patchStyleText } from '@lexical/selection'
import { $isImageNode } from '../Image/ImageNode'
import { $findMatchingParent } from '@lexical/utils'

export function $rejectSuggestion(suggestionID: string): boolean {
  const nodes = $nodesOfType(ProtonNode)
  for (const node of nodes) {
    if (!$isSuggestionNode(node)) {
      continue
    }
    const nodeSuggestionID = node.getSuggestionIdOrThrow()
    if (nodeSuggestionID !== suggestionID) {
      continue
    }
    const suggestionType = node.getSuggestionTypeOrThrow()
    if (suggestionType === 'insert') {
      node.remove()
    } else if (suggestionType === 'delete') {
      $unwrapSuggestionNode(node)
    } else if (suggestionType === 'style-change') {
      const children = node.getChildren()
      $unwrapSuggestionNode(node)
      const changedProperties = node.__properties.nodePropertiesChanged
      if (!changedProperties) {
        continue
      }
      for (const child of children) {
        if (!$isElementNode(child) && !$isTextNode(child)) {
          continue
        }
        const selectionToPatch = child.select(
          0,
          $isElementNode(child) ? child.getChildrenSize() : child.getTextContentSize(),
        )
        $patchStyleText(selectionToPatch, changedProperties)
      }
    } else if (suggestionType === 'property-change') {
      const children = node.getChildren()
      const changedProperties = node.__properties.nodePropertiesChanged
      if (!changedProperties) {
        $unwrapSuggestionNode(node)
        continue
      }
      for (const child of children) {
        for (const [key, value] of Object.entries(changedProperties)) {
          const writable = child.getWritable()
          ;(writable as any)[key] = value
        }
      }
      $unwrapSuggestionNode(node)
    } else if (suggestionType === 'split') {
      const parent = node.getParent()
      let parentNextSibling = parent?.getNextSibling<ElementNode>()
      node.remove()
      if (!$isElementNode(parent) || !$isElementNode(parentNextSibling)) {
        continue
      }
      const parentNextSiblingFirstChild = parentNextSibling.getFirstChild()
      if ($isListNode(parentNextSibling) && $isListItemNode(parentNextSiblingFirstChild)) {
        parentNextSibling = parentNextSiblingFirstChild
      }
      for (const child of parentNextSibling.getChildren()) {
        child.remove()
        parent.append(child)
      }
      parentNextSibling.remove()
    } else if (suggestionType === 'join') {
      node.remove()
    } else if (suggestionType === 'link-change') {
      const changedProperties = node.__properties.nodePropertiesChanged
      if (!changedProperties) {
        node.remove()
        continue
      }
      const initialURL = changedProperties.__url
      const linkNode = node.getFirstChildOrThrow()
      const linkWasRemoved = !$isLinkNode(linkNode)
      if (linkWasRemoved) {
        if (initialURL) {
          const newLinkNode = $createLinkNode(initialURL)
          const children = node.getChildren()
          for (const child of children) {
            newLinkNode.append(child)
          }
          node.append(newLinkNode)
          $unwrapSuggestionNode(node)
        } else {
          node.remove()
        }
        continue
      }
      $unwrapSuggestionNode(node)
      if (initialURL) {
        linkNode.setURL(initialURL)
      } else {
        const children = linkNode.getChildren()
        for (const child of children) {
          linkNode.insertBefore(child)
        }
        linkNode.remove()
        continue
      }
    } else if (suggestionType === 'image-change') {
      const changedProperties = node.__properties.nodePropertiesChanged
      if (!changedProperties) {
        node.remove()
        continue
      }
      const initialWidth = changedProperties.width
      const initialHeight = changedProperties.height
      const imageNode = node.getFirstChildOrThrow()
      $unwrapSuggestionNode(node)
      if (!$isImageNode(imageNode)) {
        continue
      }
      imageNode.setWidthAndHeight(initialWidth, initialHeight)
    } else if (suggestionType === 'indent-change') {
      const changedProperties = node.__properties.nodePropertiesChanged
      if (!changedProperties) {
        node.remove()
        continue
      }
      const indentableParent = $findMatchingParent(
        node,
        (parentNode): parentNode is ElementNode =>
          $isElementNode(parentNode) && !parentNode.isInline() && parentNode.canIndent(),
      )
      node.remove()
      indentableParent?.setIndent(changedProperties.indent)
    } else {
      node.remove()
    }
  }
  return true
}
