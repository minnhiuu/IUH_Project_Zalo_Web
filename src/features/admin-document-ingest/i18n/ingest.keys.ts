export const INGEST_KEYS = {
  page: {
    title: 'ingest.page.title',
    subtitle: 'ingest.page.subtitle',
    stepLabel: 'ingest.page.stepLabel',
    steps: {
      extract: 'ingest.page.steps.extract',
      chunk: 'ingest.page.steps.chunk',
      store: 'ingest.page.steps.store'
    }
  },
  stepOne: {
    filters: {
      fileType: 'ingest.stepOne.filters.fileType',
      status: 'ingest.stepOne.filters.status',
      search: 'ingest.stepOne.filters.search',
      searchPlaceholder: 'ingest.stepOne.filters.searchPlaceholder',
      reset: 'ingest.stepOne.filters.reset',
      addDocument: 'ingest.stepOne.filters.addDocument',
      fileTypeOptions: {
        all: 'ingest.stepOne.filters.fileTypeOptions.all',
        pdf: 'ingest.stepOne.filters.fileTypeOptions.pdf',
        docx: 'ingest.stepOne.filters.fileTypeOptions.docx',
        txt: 'ingest.stepOne.filters.fileTypeOptions.txt',
        xlsx: 'ingest.stepOne.filters.fileTypeOptions.xlsx',
        other: 'ingest.stepOne.filters.fileTypeOptions.other'
      },
      statusOptions: {
        all: 'ingest.stepOne.filters.statusOptions.all',
        ingesting: 'ingest.stepOne.filters.statusOptions.ingesting',
        completed: 'ingest.stepOne.filters.statusOptions.completed',
        failed: 'ingest.stepOne.filters.statusOptions.failed'
      }
    },
    table: {
      title: 'ingest.stepOne.table.title',
      deleteSelected: 'ingest.stepOne.table.deleteSelected',
      selectAllAria: 'ingest.stepOne.table.selectAllAria',
      fileName: 'ingest.stepOne.table.fileName',
      status: 'ingest.stepOne.table.status',
      size: 'ingest.stepOne.table.size',
      action: 'ingest.stepOne.table.action',
      emptyNoUpload: 'ingest.stepOne.table.emptyNoUpload',
      emptyFiltered: 'ingest.stepOne.table.emptyFiltered',
      extractAction: 'ingest.stepOne.table.extractAction',
      deleteAction: 'ingest.stepOne.table.deleteAction',
      page: 'ingest.stepOne.table.page'
    },
    statusBadge: {
      completed: 'ingest.stepOne.statusBadge.completed',
      ingesting: 'ingest.stepOne.statusBadge.ingesting',
      failed: 'ingest.stepOne.statusBadge.failed'
    },
    raw: {
      title: 'ingest.stepOne.raw.title',
      parsing: 'ingest.stepOne.raw.parsing',
      selectPrompt: 'ingest.stepOne.raw.selectPrompt',
      nextStep: 'ingest.stepOne.raw.nextStep'
    },
    upload: {
      title: 'ingest.stepOne.upload.title',
      description: 'ingest.stepOne.upload.description',
      dropTitle: 'ingest.stepOne.upload.dropTitle',
      dropHint: 'ingest.stepOne.upload.dropHint',
      formats: 'ingest.stepOne.upload.formats',
      selected: 'ingest.stepOne.upload.selected',
      noFile: 'ingest.stepOne.upload.noFile',
      cancel: 'ingest.stepOne.upload.cancel',
      uploading: 'ingest.stepOne.upload.uploading',
      confirm: 'ingest.stepOne.upload.confirm'
    }
  },
  stepTwo: {
    config: {
      title: 'ingest.stepTwo.config.title',
      strategy: 'ingest.stepTwo.config.strategy',
      chunkSize: 'ingest.stepTwo.config.chunkSize',
      overlap: 'ingest.stepTwo.config.overlap',
      hint: 'ingest.stepTwo.config.hint',
      process: 'ingest.stepTwo.config.process',
      processing: 'ingest.stepTwo.config.processing',
      strategies: {
        fixed: {
          label: 'ingest.stepTwo.config.strategies.fixed.label',
          desc: 'ingest.stepTwo.config.strategies.fixed.desc'
        },
        recursive: {
          label: 'ingest.stepTwo.config.strategies.recursive.label',
          desc: 'ingest.stepTwo.config.strategies.recursive.desc'
        },
        semantic: {
          label: 'ingest.stepTwo.config.strategies.semantic.label',
          desc: 'ingest.stepTwo.config.strategies.semantic.desc'
        },
        excelRow: {
          label: 'ingest.stepTwo.config.strategies.excelRow.label',
          desc: 'ingest.stepTwo.config.strategies.excelRow.desc'
        }
      }
    },
    list: {
      title: 'ingest.stepTwo.list.title',
      count: 'ingest.stepTwo.list.count',
      tokenSuffix: 'ingest.stepTwo.list.tokenSuffix',
      pageNumber: 'ingest.stepTwo.list.pageNumber',
      empty: 'ingest.stepTwo.list.empty',
      next: 'ingest.stepTwo.list.next'
    }
  },
  stepThree: {
    status: {
      success: 'ingest.stepThree.status.success',
      failed: 'ingest.stepThree.status.failed',
      finalizing: 'ingest.stepThree.status.finalizing',
      vectorizing: 'ingest.stepThree.status.vectorizing'
    },
    runtime: {
      systemStarting: 'ingest.stepThree.runtime.systemStarting',
      noProgress: 'ingest.stepThree.runtime.noProgress',
      timeout: 'ingest.stepThree.runtime.timeout',
      startFailed: 'ingest.stepThree.runtime.startFailed'
    },
    progress: {
      title: 'ingest.stepThree.progress.title',
      readyTitle: 'ingest.stepThree.progress.readyTitle',
      ingestingTitle: 'ingest.stepThree.progress.ingestingTitle',
      readyDesc: 'ingest.stepThree.progress.readyDesc',
      ingestingDesc: 'ingest.stepThree.progress.ingestingDesc',
      syncProgress: 'ingest.stepThree.progress.syncProgress',
      uploadedSummary: 'ingest.stepThree.progress.uploadedSummary',
      uploadedSummaryWithCurrent: 'ingest.stepThree.progress.uploadedSummaryWithCurrent',
      stats: {
        securityLabel: 'ingest.stepThree.progress.stats.securityLabel',
        securityValue: 'ingest.stepThree.progress.stats.securityValue',
        performanceLabel: 'ingest.stepThree.progress.stats.performanceLabel',
        performanceValue: 'ingest.stepThree.progress.stats.performanceValue',
        cdnLabel: 'ingest.stepThree.progress.stats.cdnLabel',
        cdnValue: 'ingest.stepThree.progress.stats.cdnValue'
      }
    },
    terminal: {
      title: 'ingest.stepThree.terminal.title',
      logCount: 'ingest.stepThree.terminal.logCount',
      waiting: 'ingest.stepThree.terminal.waiting'
    },
    actions: {
      download: 'ingest.stepThree.actions.download',
      backDashboard: 'ingest.stepThree.actions.backDashboard'
    }
  }
} as const
