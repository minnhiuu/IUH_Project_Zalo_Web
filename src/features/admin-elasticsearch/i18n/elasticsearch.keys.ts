export const ELASTICSEARCH_KEYS = {
  title: 'elasticsearch.title',
  description: 'elasticsearch.description',
  modules: {
    users: 'elasticsearch.modules.users',
    messages: 'elasticsearch.modules.messages',
    groups: 'elasticsearch.modules.groups'
  },
  actions: {
    reindexAll: 'elasticsearch.actions.reindexAll',
    syncNow: 'elasticsearch.actions.syncNow',
    inspectDoc: 'elasticsearch.actions.inspectDoc',
    analyzeText: 'elasticsearch.actions.analyzeText',
    elkDocs: 'elasticsearch.actions.elkDocs',
    backToDashboard: 'elasticsearch.actions.backToDashboard'
  },
  health: {
    title: 'elasticsearch.health.title',
    cluster: 'elasticsearch.health.cluster',
    alias: 'elasticsearch.health.alias',
    index: 'elasticsearch.health.index',
    healthy: 'elasticsearch.health.healthy',
    issues: 'elasticsearch.health.issues',
    online: 'elasticsearch.health.online',
    green: 'elasticsearch.health.statuses.green',
    yellow: 'elasticsearch.health.statuses.yellow',
    red: 'elasticsearch.health.statuses.red',
    unreachable: 'elasticsearch.health.statuses.unreachable'
  },
  stats: {
    title: 'elasticsearch.stats.title',
    documents: 'elasticsearch.stats.documents',
    storage: 'elasticsearch.stats.storage',
    shards: 'elasticsearch.stats.shards',
    replicas: 'elasticsearch.stats.replicas',
    indexedDocuments: 'elasticsearch.stats.indexedDocuments'
  },
  compare: {
    title: 'elasticsearch.compare.title',
    mongodb: 'elasticsearch.compare.mongodb',
    elasticsearch: 'elasticsearch.compare.elasticsearch',
    inSync: 'elasticsearch.compare.statuses.inSync',
    esAhead: 'elasticsearch.compare.statuses.esAhead',
    dbAhead: 'elasticsearch.compare.statuses.dbAhead',
    inSyncDesc: 'elasticsearch.compare.descriptions.inSync',
    esAheadDesc: 'elasticsearch.compare.descriptions.esAhead',
    dbAheadDesc: 'elasticsearch.compare.descriptions.dbAhead'
  },
  history: {
    title: 'elasticsearch.history.title',
    description: 'elasticsearch.history.description',
    live: 'elasticsearch.history.live',
    active: 'elasticsearch.history.active',
    noIndexes: 'elasticsearch.history.noIndexes',
    snapshotVersion: 'elasticsearch.history.snapshotVersion'
  },
  comingSoon: {
    title: 'elasticsearch.comingSoon.title',
    description: 'elasticsearch.comingSoon.description'
  },
  toolbox: {
    title: 'elasticsearch.toolbox.title',
    description: 'elasticsearch.toolbox.description',
    individualSync: 'elasticsearch.toolbox.individualSync',
    syncDescription: 'elasticsearch.toolbox.syncDescription',
    userIdPlaceholder: 'elasticsearch.toolbox.userIdPlaceholder',
    syncButton: 'elasticsearch.toolbox.syncButton',
    synchronizing: 'elasticsearch.toolbox.synchronizing',
    inspectDescription: 'elasticsearch.toolbox.inspectDescription',
    analyzeDescription: 'elasticsearch.toolbox.analyzeDescription',
    restrictedZone: 'elasticsearch.toolbox.restrictedZone'
  },
  dashboard: {
    headerTitle: 'elasticsearch.dashboard.headerTitle',
    headerSubtitle: 'elasticsearch.dashboard.headerSubtitle',
    messagesComingSoon: 'elasticsearch.dashboard.messagesComingSoon',
    groupsComingSoon: 'elasticsearch.dashboard.groupsComingSoon',
    noData: 'elasticsearch.dashboard.noData',
    primaryActive: 'elasticsearch.dashboard.primaryActive',
    connecting: 'elasticsearch.dashboard.connecting',
    notDefined: 'elasticsearch.dashboard.notDefined',
    loading: 'elasticsearch.dashboard.loading'
  },
  controlBar: {
    inputPlaceholder: 'elasticsearch.controlBar.inputPlaceholder',
    syncUser: 'elasticsearch.controlBar.syncUser',
    reindexAll: 'elasticsearch.controlBar.reindexAll',
    reindexMessages: 'elasticsearch.controlBar.reindexMessages',
    reindexGroups: 'elasticsearch.controlBar.reindexGroups',
    retryDeadEvents: 'elasticsearch.controlBar.retryDeadEvents',
    dialog: {
      reindexAll: {
        title: 'elasticsearch.controlBar.dialog.reindexAll.title',
        description: 'elasticsearch.controlBar.dialog.reindexAll.description'
      },
      cancel: 'elasticsearch.controlBar.dialog.cancel',
      confirm: 'elasticsearch.controlBar.dialog.confirm'
    }
  },
  progressBar: {
    titleRunning: 'elasticsearch.progressBar.titleRunning',
    titleCompleted: 'elasticsearch.progressBar.titleCompleted',
    titleFailed: 'elasticsearch.progressBar.titleFailed',
    close: 'elasticsearch.progressBar.close'
  },
  userTab: {
    statusCardTitle: 'elasticsearch.userTab.statusCardTitle',
    badges: {
      sync: 'elasticsearch.userTab.badges.sync',
      diff: 'elasticsearch.userTab.badges.diff',
      match: 'elasticsearch.userTab.badges.match',
      missMatch: 'elasticsearch.userTab.badges.missMatch',
      active: 'elasticsearch.userTab.badges.active',
      standby: 'elasticsearch.userTab.badges.standby'
    },
    listTitle: 'elasticsearch.userTab.listTitle',
    total: 'elasticsearch.userTab.total',
    deadEventsLabel: 'elasticsearch.userTab.deadEventsLabel',
    deadEventsTooltip: 'elasticsearch.userTab.deadEventsTooltip',
    table: {
      indexName: 'elasticsearch.userTab.table.indexName',
      docs: 'elasticsearch.userTab.table.docs',
      storage: 'elasticsearch.userTab.table.storage',
      created: 'elasticsearch.userTab.table.created',
      status: 'elasticsearch.userTab.table.status',
      actions: 'elasticsearch.userTab.table.actions'
    },
    dialogs: {
      switchAlias: {
        title: 'elasticsearch.userTab.dialogs.switchAlias.title',
        description: 'elasticsearch.userTab.dialogs.switchAlias.description',
        confirm: 'elasticsearch.userTab.dialogs.switchAlias.confirm'
      },
      deleteIndex: {
        title: 'elasticsearch.userTab.dialogs.deleteIndex.title',
        description: 'elasticsearch.userTab.dialogs.deleteIndex.description',
        confirm: 'elasticsearch.userTab.dialogs.deleteIndex.confirm'
      },
      deadEvents: {
        title: 'elasticsearch.userTab.dialogs.deadEvents.title',
        description: 'elasticsearch.userTab.dialogs.deadEvents.description',
        empty: 'elasticsearch.userTab.dialogs.deadEvents.empty',
        payloadLabel: 'elasticsearch.userTab.dialogs.deadEvents.payloadLabel',
        retryLabel: 'elasticsearch.userTab.dialogs.deadEvents.retryLabel',
        idLabel: 'elasticsearch.userTab.dialogs.deadEvents.idLabel',
        reasonLabel: 'elasticsearch.userTab.dialogs.deadEvents.reasonLabel'
      },
      cancel: 'elasticsearch.userTab.dialogs.cancel'
    }
  },
  messages: {
    reindexAllSuccess: 'elasticsearch.messages.reindexAllSuccess',
    reindexUserSuccess: 'elasticsearch.messages.reindexUserSuccess',
    errorReindexAll: 'elasticsearch.messages.errorReindexAll',
    errorReindexUser: 'elasticsearch.messages.errorReindexUser',
    retryDeadEventsSuccess: 'elasticsearch.messages.retryDeadEventsSuccess',
    retryDeadEventsError: 'elasticsearch.messages.retryDeadEventsError',
    errorSwitchAlias: 'elasticsearch.messages.errorSwitchAlias',
    errorDeleteIndex: 'elasticsearch.messages.errorDeleteIndex',
    notImplemented: 'elasticsearch.messages.notImplemented'
  },
  dlq: {
    title: 'elasticsearch.dlq.title',
    subtitle: 'elasticsearch.dlq.subtitle',
    retryAll: 'elasticsearch.dlq.retryAll',
    retrying: 'elasticsearch.dlq.retrying',
    searchPlaceholder: 'elasticsearch.dlq.searchPlaceholder',
    allEvents: 'elasticsearch.dlq.allEvents',
    allRetries: 'elasticsearch.dlq.allRetries',
    notRetried: 'elasticsearch.dlq.notRetried',
    retryRange1_3: 'elasticsearch.dlq.retryRange1_3',
    retryRangeOver3: 'elasticsearch.dlq.retryRangeOver3',
    allTime: 'elasticsearch.dlq.allTime',
    last30m: 'elasticsearch.dlq.last30m',
    last1h: 'elasticsearch.dlq.last1h',
    last6h: 'elasticsearch.dlq.last6h',
    last24h: 'elasticsearch.dlq.last24h',
    today: 'elasticsearch.dlq.today',
    yesterday: 'elasticsearch.dlq.yesterday',
    last3d: 'elasticsearch.dlq.last3d',
    last7d: 'elasticsearch.dlq.last7d',
    customRange: 'elasticsearch.dlq.customRange',
    fromDate: 'elasticsearch.dlq.fromDate',
    toDate: 'elasticsearch.dlq.toDate',
    clearFilters: 'elasticsearch.dlq.clearFilters',
    filterButton: 'elasticsearch.dlq.filterButton',
    stt: 'elasticsearch.dlq.table.stt',
    aggregateId: 'elasticsearch.dlq.table.aggregateId',
    eventType: 'elasticsearch.dlq.table.eventType',
    errorMessage: 'elasticsearch.dlq.table.errorMessage',
    retryCount: 'elasticsearch.dlq.table.retryCount',
    status: 'elasticsearch.dlq.table.status',
    updatedAt: 'elasticsearch.dlq.table.updatedAt',
    actions: 'elasticsearch.dlq.table.actions',
    noData: 'elasticsearch.dlq.noData',
    statusNew: 'elasticsearch.dlq.status.new',
    statusRetrying: 'elasticsearch.dlq.status.retrying',
    statusCritical: 'elasticsearch.dlq.status.critical',
    viewDetail: 'elasticsearch.dlq.actions.viewDetail',
    cancelRecord: 'elasticsearch.dlq.actions.cancelRecord',
    showing: 'elasticsearch.dlq.pagination.showing',
    of: 'elasticsearch.dlq.pagination.of',
    incidents: 'elasticsearch.dlq.pagination.incidents',
    modal: {
      title: 'elasticsearch.dlq.modal.title',
      subtitle: 'elasticsearch.dlq.modal.subtitle',
      errorTitle: 'elasticsearch.dlq.modal.errorTitle',
      noErrorMessage: 'elasticsearch.dlq.modal.noErrorMessage',
      jsonTitle: 'elasticsearch.dlq.modal.jsonTitle',
      close: 'elasticsearch.dlq.modal.close'
    },
    to: 'elasticsearch.dlq.to',
    tooltip: {
      prefix: 'elasticsearch.dlq.tooltip.prefix',
      allPrefix: 'elasticsearch.dlq.tooltip.allPrefix',
      timeLabel: 'elasticsearch.dlq.tooltip.timeLabel',
      eventLabel: 'elasticsearch.dlq.tooltip.eventLabel'
    },
    unknownError: 'elasticsearch.dlq.unknownError'
  }
} as const
