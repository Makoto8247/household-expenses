import { createViewModel } from "./categories-view-model";
import { Frame } from "@nativescript/core";

let viewModel;

export function onLoaded(args) {
    const page = args.object;
    viewModel = createViewModel();
    page.bindingContext = viewModel;
    
    // ページが読み込まれた時に初期化
    viewModel.initialize();
}

export function onBackTap() {
    Frame.topmost().goBack();
}
