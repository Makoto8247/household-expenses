import { fromObject } from '@nativescript/core'
import { Frame } from '@nativescript/core'

import { SelectedPageService } from '../shared/selected-page-service'

export function SettingsViewModel() {
  SelectedPageService.getInstance().updateSelectedPage('Settings')

  const viewModel = fromObject({
    // カテゴリ設定ページに遷移
    navigateToCategories: function() {
      Frame.topmost().navigate("settings/categories/categories-page");
    }
  })

  return viewModel
}
