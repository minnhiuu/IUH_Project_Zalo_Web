import type { TFunction } from 'i18next'
import { ELASTICSEARCH_KEYS } from './elasticsearch.keys'

export interface ElasticsearchTexts {
  title: string
  description: string
  modules: {
    users: string
    messages: string
    groups: string
  }
  actions: {
    reindexAll: string
    syncNow: string
    inspectDoc: string
    analyzeText: string
    elkDocs: string
    backToDashboard: string
  }
  health: {
    title: string
    cluster: string
    alias: string
    index: string
    healthy: string
    issues: string
    online: string
    statuses: {
      green: string
      yellow: string
      red: string
      unreachable: string
    }
  }
  stats: {
    title: string
    documents: string
    storage: string
    shards: string
    replicas: string
    indexedDocuments: string
  }
  compare: {
    title: string
    mongodb: string
    elasticsearch: string
    statuses: {
      inSync: string
      esAhead: string
      dbAhead: string
    }
    descriptions: {
      inSync: string
      esAhead: string
      dbAhead: string
    }
  }
  history: {
    title: string
    description: string
    live: string
    active: string
    noIndexes: string
    snapshotVersion: string
  }
  comingSoon: {
    title: string
    description: string
  }
  toolbox: {
    title: string
    description: string
    individualSync: string
    syncDescription: string
    userIdPlaceholder: string
    syncButton: string
    synchronizing: string
    inspectDescription: string
    analyzeDescription: string
    restrictedZone: string
  }
  dashboard: {
    headerTitle: string
    headerSubtitle: string
    messagesComingSoon: string
    groupsComingSoon: string
    noData: string
    primaryActive: string
    connecting: string
    notDefined: string
    loading: string
  }
  controlBar: {
    inputPlaceholder: string
    syncUser: string
    sync: string
    reindexAll: string
    reindexMessages: string
    reindexGroups: string
    retryDeadEvents: string
    dialog: {
      reindexAll: {
        title: string
        description: string
      }
      cancel: string
      confirm: string
    }
  }
  progressBar: {
    titleRunning: string
    titleCompleted: string
    titleFailed: string
    close: string
  }
  userTab: {
    statusCardTitle: string
    badges: {
      sync: string
      diff: string
      match: string
      missMatch: string
      active: string
      standby: string
    }
    listTitle: string
    total: string
    deadEventsLabel: string
    deadEventsTooltip: string
    table: {
      indexName: string
      docs: string
      storage: string
      created: string
      status: string
      actions: string
    }
    dialogs: {
      switchAlias: {
        title: string
        description: string
        confirm: string
      }
      deleteIndex: {
        title: string
        description: string
        confirm: string
      }
      deadEvents: {
        title: string
        description: string
        empty: string
        payloadLabel: string
        retryLabel: string
        idLabel: string
        reasonLabel: string
      }
      cancel: string
    }
  }
  messages: {
    reindexAllSuccess: string
    reindexUserSuccess: string
    errorReindexAll: string
    errorReindexUser: string
    retryDeadEventsSuccess: string
    retryDeadEventsError: string
    errorSwitchAlias: string
    errorDeleteIndex: string
    notImplemented: string
  }
  dlq: {
    title: string
    subtitle: string
    retryAll: string
    retrying: string
    searchPlaceholder: string
    allEvents: string
    allRetries: string
    notRetried: string
    retryRange1_3: string
    retryRangeOver3: string
    allTime: string
    last30m: string
    last1h: string
    last6h: string
    last24h: string
    today: string
    yesterday: string
    last3d: string
    last7d: string
    customRange: string
    fromDate: string
    toDate: string
    clearFilters: string
    filterButton: string
    to: string
    table: {
      stt: string
      aggregateId: string
      eventType: string
      errorMessage: string
      retryCount: string
      status: string
      updatedAt: string
      actions: string
    }
    noData: string
    actions: {
      viewDetail: string
      cancelRecord: string
      retrySingle: string
      markResolved: string
      markUnprocessed: string
    }
    status: {
      new: string
      retrying: string
      critical: string
      unprocessed: string
      processed: string
    }
    label: {
      status: string
      time: string
    }
    retryRangeXh: string
    retryRangeXd: string
    retryRangeButton: string
    pagination: {
      showing: string
      of: string
      incidents: string
    }
    modal: {
      title: string
      subtitle: string
      errorTitle: string
      noErrorMessage: string
      jsonTitle: string
      retryCount: string
      retryUnit: string
      close: string
    }
    tooltip: {
      prefix: string
      allPrefix: string
      timeLabel: string
      eventLabel: string
    }
    unknownError: string
    bulk: {
      selectedCount: string
      retrySelected: string
    }
  }
  errors: {
    updateStatus: string
    retrySingle: string
    retryAll: string
    retryDuration: string
    retryBulk: string
  }
}

export const createElasticsearchTexts = (t: TFunction<'admin-elasticsearch'>): ElasticsearchTexts => ({
  title: t(ELASTICSEARCH_KEYS.title),
  description: t(ELASTICSEARCH_KEYS.description),
  modules: {
    users: t(ELASTICSEARCH_KEYS.modules.users),
    messages: t(ELASTICSEARCH_KEYS.modules.messages),
    groups: t(ELASTICSEARCH_KEYS.modules.groups)
  },
  actions: {
    reindexAll: t(ELASTICSEARCH_KEYS.actions.reindexAll),
    syncNow: t(ELASTICSEARCH_KEYS.actions.syncNow),
    inspectDoc: t(ELASTICSEARCH_KEYS.actions.inspectDoc),
    analyzeText: t(ELASTICSEARCH_KEYS.actions.analyzeText),
    elkDocs: t(ELASTICSEARCH_KEYS.actions.elkDocs),
    backToDashboard: t(ELASTICSEARCH_KEYS.actions.backToDashboard)
  },
  health: {
    title: t(ELASTICSEARCH_KEYS.health.title),
    cluster: t(ELASTICSEARCH_KEYS.health.cluster),
    alias: t(ELASTICSEARCH_KEYS.health.alias),
    index: t(ELASTICSEARCH_KEYS.health.index),
    healthy: t(ELASTICSEARCH_KEYS.health.healthy),
    issues: t(ELASTICSEARCH_KEYS.health.issues),
    online: t(ELASTICSEARCH_KEYS.health.online),
    statuses: {
      green: t(ELASTICSEARCH_KEYS.health.green),
      yellow: t(ELASTICSEARCH_KEYS.health.yellow),
      red: t(ELASTICSEARCH_KEYS.health.red),
      unreachable: t(ELASTICSEARCH_KEYS.health.unreachable)
    }
  },
  stats: {
    title: t(ELASTICSEARCH_KEYS.stats.title),
    documents: t(ELASTICSEARCH_KEYS.stats.documents),
    storage: t(ELASTICSEARCH_KEYS.stats.storage),
    shards: t(ELASTICSEARCH_KEYS.stats.shards),
    replicas: t(ELASTICSEARCH_KEYS.stats.replicas),
    indexedDocuments: t(ELASTICSEARCH_KEYS.stats.indexedDocuments)
  },
  compare: {
    title: t(ELASTICSEARCH_KEYS.compare.title),
    mongodb: t(ELASTICSEARCH_KEYS.compare.mongodb),
    elasticsearch: t(ELASTICSEARCH_KEYS.compare.elasticsearch),
    statuses: {
      inSync: t(ELASTICSEARCH_KEYS.compare.inSync),
      esAhead: t(ELASTICSEARCH_KEYS.compare.esAhead),
      dbAhead: t(ELASTICSEARCH_KEYS.compare.dbAhead)
    },
    descriptions: {
      inSync: t(ELASTICSEARCH_KEYS.compare.inSyncDesc),
      esAhead: t(ELASTICSEARCH_KEYS.compare.esAheadDesc),
      dbAhead: t(ELASTICSEARCH_KEYS.compare.dbAheadDesc)
    }
  },
  history: {
    title: t(ELASTICSEARCH_KEYS.history.title),
    description: t(ELASTICSEARCH_KEYS.history.description),
    live: t(ELASTICSEARCH_KEYS.history.live),
    active: t(ELASTICSEARCH_KEYS.history.active),
    noIndexes: t(ELASTICSEARCH_KEYS.history.noIndexes),
    snapshotVersion: t(ELASTICSEARCH_KEYS.history.snapshotVersion)
  },
  comingSoon: {
    title: t(ELASTICSEARCH_KEYS.comingSoon.title),
    description: t(ELASTICSEARCH_KEYS.comingSoon.description)
  },
  toolbox: {
    title: t(ELASTICSEARCH_KEYS.toolbox.title),
    description: t(ELASTICSEARCH_KEYS.toolbox.description),
    individualSync: t(ELASTICSEARCH_KEYS.toolbox.individualSync),
    syncDescription: t(ELASTICSEARCH_KEYS.toolbox.syncDescription),
    userIdPlaceholder: t(ELASTICSEARCH_KEYS.toolbox.userIdPlaceholder),
    syncButton: t(ELASTICSEARCH_KEYS.toolbox.syncButton),
    synchronizing: t(ELASTICSEARCH_KEYS.toolbox.synchronizing),
    inspectDescription: t(ELASTICSEARCH_KEYS.toolbox.inspectDescription),
    analyzeDescription: t(ELASTICSEARCH_KEYS.toolbox.analyzeDescription),
    restrictedZone: t(ELASTICSEARCH_KEYS.toolbox.restrictedZone)
  },
  dashboard: {
    headerTitle: t(ELASTICSEARCH_KEYS.dashboard.headerTitle),
    headerSubtitle: t(ELASTICSEARCH_KEYS.dashboard.headerSubtitle),
    messagesComingSoon: t(ELASTICSEARCH_KEYS.dashboard.messagesComingSoon),
    groupsComingSoon: t(ELASTICSEARCH_KEYS.dashboard.groupsComingSoon),
    noData: t(ELASTICSEARCH_KEYS.dashboard.noData),
    primaryActive: t(ELASTICSEARCH_KEYS.dashboard.primaryActive),
    connecting: t(ELASTICSEARCH_KEYS.dashboard.connecting),
    notDefined: t(ELASTICSEARCH_KEYS.dashboard.notDefined),
    loading: t(ELASTICSEARCH_KEYS.dashboard.loading)
  },
  controlBar: {
    inputPlaceholder: t(ELASTICSEARCH_KEYS.controlBar.inputPlaceholder),
    syncUser: t(ELASTICSEARCH_KEYS.controlBar.syncUser),
    sync: t(ELASTICSEARCH_KEYS.controlBar.sync),
    reindexAll: t(ELASTICSEARCH_KEYS.controlBar.reindexAll),
    reindexMessages: t(ELASTICSEARCH_KEYS.controlBar.reindexMessages),
    reindexGroups: t(ELASTICSEARCH_KEYS.controlBar.reindexGroups),
    retryDeadEvents: t(ELASTICSEARCH_KEYS.controlBar.retryDeadEvents),
    dialog: {
      reindexAll: {
        title: t(ELASTICSEARCH_KEYS.controlBar.dialog.reindexAll.title),
        description: t(ELASTICSEARCH_KEYS.controlBar.dialog.reindexAll.description)
      },
      cancel: t(ELASTICSEARCH_KEYS.controlBar.dialog.cancel),
      confirm: t(ELASTICSEARCH_KEYS.controlBar.dialog.confirm)
    }
  },
  progressBar: {
    titleRunning: t(ELASTICSEARCH_KEYS.progressBar.titleRunning),
    titleCompleted: t(ELASTICSEARCH_KEYS.progressBar.titleCompleted),
    titleFailed: t(ELASTICSEARCH_KEYS.progressBar.titleFailed),
    close: t(ELASTICSEARCH_KEYS.progressBar.close)
  },
  userTab: {
    statusCardTitle: t(ELASTICSEARCH_KEYS.userTab.statusCardTitle),
    badges: {
      sync: t(ELASTICSEARCH_KEYS.userTab.badges.sync),
      diff: t(ELASTICSEARCH_KEYS.userTab.badges.diff),
      match: t(ELASTICSEARCH_KEYS.userTab.badges.match),
      missMatch: t(ELASTICSEARCH_KEYS.userTab.badges.missMatch),
      active: t(ELASTICSEARCH_KEYS.userTab.badges.active),
      standby: t(ELASTICSEARCH_KEYS.userTab.badges.standby)
    },
    listTitle: t(ELASTICSEARCH_KEYS.userTab.listTitle),
    total: t(ELASTICSEARCH_KEYS.userTab.total),
    deadEventsLabel: t(ELASTICSEARCH_KEYS.userTab.deadEventsLabel),
    deadEventsTooltip: t(ELASTICSEARCH_KEYS.userTab.deadEventsTooltip),
    table: {
      indexName: t(ELASTICSEARCH_KEYS.userTab.table.indexName),
      docs: t(ELASTICSEARCH_KEYS.userTab.table.docs),
      storage: t(ELASTICSEARCH_KEYS.userTab.table.storage),
      created: t(ELASTICSEARCH_KEYS.userTab.table.created),
      status: t(ELASTICSEARCH_KEYS.userTab.table.status),
      actions: t(ELASTICSEARCH_KEYS.userTab.table.actions)
    },
    dialogs: {
      switchAlias: {
        title: t(ELASTICSEARCH_KEYS.userTab.dialogs.switchAlias.title),
        description: t(ELASTICSEARCH_KEYS.userTab.dialogs.switchAlias.description),
        confirm: t(ELASTICSEARCH_KEYS.userTab.dialogs.switchAlias.confirm)
      },
      deleteIndex: {
        title: t(ELASTICSEARCH_KEYS.userTab.dialogs.deleteIndex.title),
        description: t(ELASTICSEARCH_KEYS.userTab.dialogs.deleteIndex.description),
        confirm: t(ELASTICSEARCH_KEYS.userTab.dialogs.deleteIndex.confirm)
      },
      deadEvents: {
        title: t(ELASTICSEARCH_KEYS.userTab.dialogs.deadEvents.title),
        description: t(ELASTICSEARCH_KEYS.userTab.dialogs.deadEvents.description),
        empty: t(ELASTICSEARCH_KEYS.userTab.dialogs.deadEvents.empty),
        payloadLabel: t(ELASTICSEARCH_KEYS.userTab.dialogs.deadEvents.payloadLabel),
        retryLabel: t(ELASTICSEARCH_KEYS.userTab.dialogs.deadEvents.retryLabel),
        idLabel: t(ELASTICSEARCH_KEYS.userTab.dialogs.deadEvents.idLabel),
        reasonLabel: t(ELASTICSEARCH_KEYS.userTab.dialogs.deadEvents.reasonLabel)
      },
      cancel: t(ELASTICSEARCH_KEYS.userTab.dialogs.cancel)
    }
  },
  messages: {
    reindexAllSuccess: t(ELASTICSEARCH_KEYS.messages.reindexAllSuccess),
    reindexUserSuccess: t(ELASTICSEARCH_KEYS.messages.reindexUserSuccess),
    errorReindexAll: t(ELASTICSEARCH_KEYS.messages.errorReindexAll),
    errorReindexUser: t(ELASTICSEARCH_KEYS.messages.errorReindexUser),
    retryDeadEventsSuccess: t(ELASTICSEARCH_KEYS.messages.retryDeadEventsSuccess),
    retryDeadEventsError: t(ELASTICSEARCH_KEYS.messages.retryDeadEventsError),
    errorSwitchAlias: t(ELASTICSEARCH_KEYS.messages.errorSwitchAlias),
    errorDeleteIndex: t(ELASTICSEARCH_KEYS.messages.errorDeleteIndex),
    notImplemented: t(ELASTICSEARCH_KEYS.messages.notImplemented)
  },
  dlq: {
    title: t(ELASTICSEARCH_KEYS.dlq.title),
    subtitle: t(ELASTICSEARCH_KEYS.dlq.subtitle),
    retryAll: t(ELASTICSEARCH_KEYS.dlq.retryAll),
    retrying: t(ELASTICSEARCH_KEYS.dlq.retrying),
    searchPlaceholder: t(ELASTICSEARCH_KEYS.dlq.searchPlaceholder),
    allEvents: t(ELASTICSEARCH_KEYS.dlq.allEvents),
    allRetries: t(ELASTICSEARCH_KEYS.dlq.allRetries),
    notRetried: t(ELASTICSEARCH_KEYS.dlq.notRetried),
    retryRange1_3: t(ELASTICSEARCH_KEYS.dlq.retryRange1_3),
    retryRangeOver3: t(ELASTICSEARCH_KEYS.dlq.retryRangeOver3),
    allTime: t(ELASTICSEARCH_KEYS.dlq.allTime),
    last30m: t(ELASTICSEARCH_KEYS.dlq.last30m),
    last1h: t(ELASTICSEARCH_KEYS.dlq.last1h),
    last6h: t(ELASTICSEARCH_KEYS.dlq.last6h),
    last24h: t(ELASTICSEARCH_KEYS.dlq.last24h),
    today: t(ELASTICSEARCH_KEYS.dlq.today),
    yesterday: t(ELASTICSEARCH_KEYS.dlq.yesterday),
    last3d: t(ELASTICSEARCH_KEYS.dlq.last3d),
    last7d: t(ELASTICSEARCH_KEYS.dlq.last7d),
    customRange: t(ELASTICSEARCH_KEYS.dlq.customRange),
    fromDate: t(ELASTICSEARCH_KEYS.dlq.fromDate),
    toDate: t(ELASTICSEARCH_KEYS.dlq.toDate),
    clearFilters: t(ELASTICSEARCH_KEYS.dlq.clearFilters),
    filterButton: t(ELASTICSEARCH_KEYS.dlq.filterButton),
    to: t(ELASTICSEARCH_KEYS.dlq.to),
    table: {
      stt: t(ELASTICSEARCH_KEYS.dlq.stt),
      aggregateId: t(ELASTICSEARCH_KEYS.dlq.aggregateId),
      eventType: t(ELASTICSEARCH_KEYS.dlq.eventType),
      errorMessage: t(ELASTICSEARCH_KEYS.dlq.errorMessage),
      retryCount: t(ELASTICSEARCH_KEYS.dlq.retryCount),
      status: t(ELASTICSEARCH_KEYS.dlq.tableStatus),
      updatedAt: t(ELASTICSEARCH_KEYS.dlq.updatedAt),
      actions: t(ELASTICSEARCH_KEYS.dlq.tableActions)
    },
    noData: t(ELASTICSEARCH_KEYS.dlq.noData),
    actions: {
      viewDetail: t(ELASTICSEARCH_KEYS.dlq.actions.viewDetail),
      cancelRecord: t(ELASTICSEARCH_KEYS.dlq.actions.cancelRecord),
      retrySingle: t(ELASTICSEARCH_KEYS.dlq.actions.retrySingle),
      markResolved: t(ELASTICSEARCH_KEYS.dlq.actions.markResolved),
      markUnprocessed: t(ELASTICSEARCH_KEYS.dlq.actions.markUnprocessed)
    },
    status: {
      new: t(ELASTICSEARCH_KEYS.dlq.status.new),
      retrying: t(ELASTICSEARCH_KEYS.dlq.status.retrying),
      critical: t(ELASTICSEARCH_KEYS.dlq.status.critical),
      unprocessed: t(ELASTICSEARCH_KEYS.dlq.status.unprocessed),
      processed: t(ELASTICSEARCH_KEYS.dlq.status.processed)
    },
    label: {
      status: t(ELASTICSEARCH_KEYS.dlq.labelStatus),
      time: t(ELASTICSEARCH_KEYS.dlq.labelTime)
    },
    retryRangeXh: t(ELASTICSEARCH_KEYS.dlq.retryRangeXh),
    retryRangeXd: t(ELASTICSEARCH_KEYS.dlq.retryRangeXd),
    retryRangeButton: t(ELASTICSEARCH_KEYS.dlq.retryRangeButton),
    pagination: {
      showing: t(ELASTICSEARCH_KEYS.dlq.showing),
      of: t(ELASTICSEARCH_KEYS.dlq.of),
      incidents: t(ELASTICSEARCH_KEYS.dlq.incidents)
    },
    modal: {
      title: t(ELASTICSEARCH_KEYS.dlq.modal.title),
      subtitle: t(ELASTICSEARCH_KEYS.dlq.modal.subtitle),
      errorTitle: t(ELASTICSEARCH_KEYS.dlq.modal.errorTitle),
      noErrorMessage: t(ELASTICSEARCH_KEYS.dlq.modal.noErrorMessage),
      jsonTitle: t(ELASTICSEARCH_KEYS.dlq.modal.jsonTitle),
      retryCount: t(ELASTICSEARCH_KEYS.dlq.modal.retryCount),
      retryUnit: t(ELASTICSEARCH_KEYS.dlq.modal.retryUnit),
      close: t(ELASTICSEARCH_KEYS.dlq.modal.close)
    },
    tooltip: {
      prefix: t(ELASTICSEARCH_KEYS.dlq.tooltip.prefix),
      allPrefix: t(ELASTICSEARCH_KEYS.dlq.tooltip.allPrefix),
      timeLabel: t(ELASTICSEARCH_KEYS.dlq.tooltip.timeLabel),
      eventLabel: t(ELASTICSEARCH_KEYS.dlq.tooltip.eventLabel)
    },
    unknownError: t(ELASTICSEARCH_KEYS.dlq.unknownError),
    bulk: {
      selectedCount: t(ELASTICSEARCH_KEYS.dlq.bulk.selectedCount),
      retrySelected: t(ELASTICSEARCH_KEYS.dlq.bulk.retrySelected)
    }
  },
  errors: {
    updateStatus: t(ELASTICSEARCH_KEYS.errors.updateStatus),
    retrySingle: t(ELASTICSEARCH_KEYS.errors.retrySingle),
    retryAll: t(ELASTICSEARCH_KEYS.errors.retryAll),
    retryDuration: t(ELASTICSEARCH_KEYS.errors.retryDuration),
    retryBulk: t(ELASTICSEARCH_KEYS.errors.retryBulk)
  }
})
