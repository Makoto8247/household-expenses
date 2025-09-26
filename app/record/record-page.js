import { Application } from '@nativescript/core'

import { RecordViewModel } from './record-view-model'

export function onNavigatingTo(args) {
  const page = args.object
  page.bindingContext = new RecordViewModel()
}

export function onDrawerButtonTap(args) {
  const sideDrawer = Application.getRootView()
  sideDrawer.showDrawer()
}

