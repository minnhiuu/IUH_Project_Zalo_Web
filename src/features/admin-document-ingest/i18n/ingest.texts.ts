import type { TFunction } from 'i18next'
import { INGEST_KEYS } from './ingest.keys'

export const createIngestTexts = (t: TFunction<'ingest'>) => ({
  page: {
    title: t(INGEST_KEYS.page.title),
    subtitle: t(INGEST_KEYS.page.subtitle),
    stepLabel: (step: number, total: number) => t(INGEST_KEYS.page.stepLabel, { step, total }),
    steps: {
      extract: t(INGEST_KEYS.page.steps.extract),
      chunk: t(INGEST_KEYS.page.steps.chunk),
      store: t(INGEST_KEYS.page.steps.store)
    }
  },
  stepOne: {
    filters: {
      fileType: t(INGEST_KEYS.stepOne.filters.fileType),
      status: t(INGEST_KEYS.stepOne.filters.status),
      search: t(INGEST_KEYS.stepOne.filters.search),
      searchPlaceholder: t(INGEST_KEYS.stepOne.filters.searchPlaceholder),
      reset: t(INGEST_KEYS.stepOne.filters.reset),
      addDocument: t(INGEST_KEYS.stepOne.filters.addDocument),
      fileTypeOptions: {
        all: t(INGEST_KEYS.stepOne.filters.fileTypeOptions.all),
        pdf: t(INGEST_KEYS.stepOne.filters.fileTypeOptions.pdf),
        docx: t(INGEST_KEYS.stepOne.filters.fileTypeOptions.docx),
        txt: t(INGEST_KEYS.stepOne.filters.fileTypeOptions.txt),
        xlsx: t(INGEST_KEYS.stepOne.filters.fileTypeOptions.xlsx),
        other: t(INGEST_KEYS.stepOne.filters.fileTypeOptions.other)
      },
      statusOptions: {
        all: t(INGEST_KEYS.stepOne.filters.statusOptions.all),
        ingesting: t(INGEST_KEYS.stepOne.filters.statusOptions.ingesting),
        completed: t(INGEST_KEYS.stepOne.filters.statusOptions.completed),
        failed: t(INGEST_KEYS.stepOne.filters.statusOptions.failed)
      }
    },
    table: {
      title: t(INGEST_KEYS.stepOne.table.title),
      deleteSelected: (count: number) => t(INGEST_KEYS.stepOne.table.deleteSelected, { count }),
      selectAllAria: t(INGEST_KEYS.stepOne.table.selectAllAria),
      fileName: t(INGEST_KEYS.stepOne.table.fileName),
      status: t(INGEST_KEYS.stepOne.table.status),
      size: t(INGEST_KEYS.stepOne.table.size),
      action: t(INGEST_KEYS.stepOne.table.action),
      emptyNoUpload: t(INGEST_KEYS.stepOne.table.emptyNoUpload),
      emptyFiltered: t(INGEST_KEYS.stepOne.table.emptyFiltered),
      extractAction: t(INGEST_KEYS.stepOne.table.extractAction),
      deleteAction: t(INGEST_KEYS.stepOne.table.deleteAction),
      page: (current: number, total: number) => t(INGEST_KEYS.stepOne.table.page, { current, total })
    },
    statusBadge: {
      completed: t(INGEST_KEYS.stepOne.statusBadge.completed),
      ingesting: t(INGEST_KEYS.stepOne.statusBadge.ingesting),
      failed: t(INGEST_KEYS.stepOne.statusBadge.failed)
    },
    raw: {
      title: t(INGEST_KEYS.stepOne.raw.title),
      parsing: t(INGEST_KEYS.stepOne.raw.parsing),
      selectPrompt: t(INGEST_KEYS.stepOne.raw.selectPrompt),
      nextStep: t(INGEST_KEYS.stepOne.raw.nextStep)
    },
    upload: {
      title: t(INGEST_KEYS.stepOne.upload.title),
      description: t(INGEST_KEYS.stepOne.upload.description),
      dropTitle: t(INGEST_KEYS.stepOne.upload.dropTitle),
      dropHint: t(INGEST_KEYS.stepOne.upload.dropHint),
      formats: t(INGEST_KEYS.stepOne.upload.formats),
      selected: t(INGEST_KEYS.stepOne.upload.selected),
      noFile: t(INGEST_KEYS.stepOne.upload.noFile),
      cancel: t(INGEST_KEYS.stepOne.upload.cancel),
      uploading: t(INGEST_KEYS.stepOne.upload.uploading),
      confirm: t(INGEST_KEYS.stepOne.upload.confirm)
    }
  },
  stepTwo: {
    config: {
      title: t(INGEST_KEYS.stepTwo.config.title),
      strategy: t(INGEST_KEYS.stepTwo.config.strategy),
      chunkSize: t(INGEST_KEYS.stepTwo.config.chunkSize),
      overlap: t(INGEST_KEYS.stepTwo.config.overlap),
      hint: t(INGEST_KEYS.stepTwo.config.hint),
      process: t(INGEST_KEYS.stepTwo.config.process),
      processing: t(INGEST_KEYS.stepTwo.config.processing),
      strategies: {
        fixed: {
          label: t(INGEST_KEYS.stepTwo.config.strategies.fixed.label),
          desc: t(INGEST_KEYS.stepTwo.config.strategies.fixed.desc)
        },
        recursive: {
          label: t(INGEST_KEYS.stepTwo.config.strategies.recursive.label),
          desc: t(INGEST_KEYS.stepTwo.config.strategies.recursive.desc)
        },
        semantic: {
          label: t(INGEST_KEYS.stepTwo.config.strategies.semantic.label),
          desc: t(INGEST_KEYS.stepTwo.config.strategies.semantic.desc)
        },
        excelRow: {
          label: t(INGEST_KEYS.stepTwo.config.strategies.excelRow.label),
          desc: t(INGEST_KEYS.stepTwo.config.strategies.excelRow.desc)
        }
      }
    },
    list: {
      title: t(INGEST_KEYS.stepTwo.list.title),
      count: (count: number) => t(INGEST_KEYS.stepTwo.list.count, { count }),
      tokenSuffix: t(INGEST_KEYS.stepTwo.list.tokenSuffix),
      pageNumber: t(INGEST_KEYS.stepTwo.list.pageNumber),
      empty: t(INGEST_KEYS.stepTwo.list.empty),
      next: t(INGEST_KEYS.stepTwo.list.next)
    }
  },
  stepThree: {
    status: {
      success: t(INGEST_KEYS.stepThree.status.success),
      failed: t(INGEST_KEYS.stepThree.status.failed),
      finalizing: t(INGEST_KEYS.stepThree.status.finalizing),
      vectorizing: t(INGEST_KEYS.stepThree.status.vectorizing)
    },
    runtime: {
      systemStarting: t(INGEST_KEYS.stepThree.runtime.systemStarting),
      noProgress: t(INGEST_KEYS.stepThree.runtime.noProgress),
      timeout: t(INGEST_KEYS.stepThree.runtime.timeout),
      startFailed: t(INGEST_KEYS.stepThree.runtime.startFailed)
    },
    progress: {
      title: t(INGEST_KEYS.stepThree.progress.title),
      readyTitle: t(INGEST_KEYS.stepThree.progress.readyTitle),
      ingestingTitle: t(INGEST_KEYS.stepThree.progress.ingestingTitle),
      readyDesc: t(INGEST_KEYS.stepThree.progress.readyDesc),
      ingestingDesc: t(INGEST_KEYS.stepThree.progress.ingestingDesc),
      syncProgress: t(INGEST_KEYS.stepThree.progress.syncProgress),
      uploadedSummary: (uploaded: number, total: number) =>
        t(INGEST_KEYS.stepThree.progress.uploadedSummary, { uploaded, total }),
      uploadedSummaryWithCurrent: (uploaded: number, total: number, currentVectorId: string) =>
        t(INGEST_KEYS.stepThree.progress.uploadedSummaryWithCurrent, { uploaded, total, currentVectorId }),
      stats: {
        securityLabel: t(INGEST_KEYS.stepThree.progress.stats.securityLabel),
        securityValue: t(INGEST_KEYS.stepThree.progress.stats.securityValue),
        performanceLabel: t(INGEST_KEYS.stepThree.progress.stats.performanceLabel),
        performanceValue: t(INGEST_KEYS.stepThree.progress.stats.performanceValue),
        cdnLabel: t(INGEST_KEYS.stepThree.progress.stats.cdnLabel),
        cdnValue: t(INGEST_KEYS.stepThree.progress.stats.cdnValue)
      }
    },
    terminal: {
      title: t(INGEST_KEYS.stepThree.terminal.title),
      logCount: (count: number) => t(INGEST_KEYS.stepThree.terminal.logCount, { count }),
      waiting: t(INGEST_KEYS.stepThree.terminal.waiting)
    },
    actions: {
      download: t(INGEST_KEYS.stepThree.actions.download),
      backDashboard: t(INGEST_KEYS.stepThree.actions.backDashboard)
    }
  }
})
