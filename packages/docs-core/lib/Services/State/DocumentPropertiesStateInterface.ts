export type DocumentPropertyName = keyof DocumentPropertyValues

export interface DocumentPropertyValues {
  userAccountEmailDocTitleEnabled: boolean
  userAccountEmailNotificationsEnabled: boolean
  currentDocumentEmailDocTitleEnabled: boolean
}

/**
 * A state object that can be subscribed to by classes that need to react to changes in private hooks.
 *
 * Or, more generally, an event bus that also holds onto the state so that new subscribers get the state
 * immediately when they subscribe.
 */
export interface DocumentPropertiesStateInterface {
  subscribe: (callback: (state: DocumentPropertyValues) => void) => () => void
  setProperty: <T extends DocumentPropertyName>(property: T, value: DocumentPropertyValues[T]) => void
  getState: () => DocumentPropertyValues
}
