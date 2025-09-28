import { Application } from '@nativescript/core'

import { RecordViewModel } from './record-view-model'

export function onNavigatingTo(args) {
  const page = args.object
  page.bindingContext = new RecordViewModel()
}

export function onLoaded(args) {
  // ページ読み込み時の処理（必要に応じて）
}

export function onDrawerButtonTap(args) {
  const sideDrawer = Application.getRootView()
  sideDrawer.showDrawer()
}

export function onExpenseTypeTap(args) {
  const viewModel = args.object.page.bindingContext
  viewModel.onExpenseTypeTap()
}

export function onIncomeTypeTap(args) {
  const viewModel = args.object.page.bindingContext
  viewModel.onIncomeTypeTap()
}

export function onRecordTap(args) {
  const viewModel = args.object.page.bindingContext
  viewModel.onRecordTap()
}

export function onDeleteRecord(args) {
  const viewModel = args.object.page.bindingContext
  viewModel.onDeleteRecord(args)
}

