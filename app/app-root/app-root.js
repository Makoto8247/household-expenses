import { Frame, Application } from '@nativescript/core';

import { AppRootViewModel } from './app-root-view-model';
import { createTables } from '../db/db';

export function onLoaded(args) {
  const drawerComponent = args.object
  drawerComponent.bindingContext = new AppRootViewModel()

  initializeDatabase();
}

export function onNavigationItemTap(args) {
  const component = args.object
  const componentRoute = component.route
  const componentTitle = component.title
  const bindingContext = component.bindingContext

  bindingContext.set('selectedPage', componentTitle)

  Frame.topmost().navigate({
    moduleName: componentRoute,
    transition: {
      name: 'fade',
    },
  })

  const drawerComponent = Application.getRootView()
  drawerComponent.closeDrawer()
}

async function initializeDatabase() {
  try {
    await createTables();
  } catch (error) {
  }
}

