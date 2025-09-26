import { fromObject } from '@nativescript/core'

import { SelectedPageService } from '../shared/selected-page-service'

export function RecordViewModel() {
  SelectedPageService.getInstance().updateSelectedPage('Record')

  const viewModel = fromObject({
    /* Add your view model properties here */
  })

  return viewModel
}

