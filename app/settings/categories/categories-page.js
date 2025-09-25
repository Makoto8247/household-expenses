import { createViewModel } from "./categories-view-model";
import { Frame, Dialogs } from "@nativescript/core";
import { deleteCategory, updateCategory } from "../../db/db";

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

// カテゴリを編集
export function onEditCategory(args) {
    const item = args.object.bindingContext;
    viewModel.set("editingCategoryId", item.id);
    viewModel.set("editCategoryName", item.name);
    viewModel.set("isEditing", true);
}

// 編集を保存
export async function onSaveCategory() {
    const name = viewModel.get("editCategoryName").trim();
    const id = viewModel.get("editingCategoryId");
    
    if (!name) {
        alert("カテゴリ名を入力してください");
        return;
    }
    
    viewModel.set("isLoading", true);
    try {
        const result = await updateCategory(id, name);
        if (result.success) {
            viewModel.set("isEditing", false);
            viewModel.set("editCategoryName", "");
            viewModel.set("editingCategoryId", null);
            viewModel.categories.splice(0); // 配列をクリア
            await viewModel.loadCategories();
            alert("カテゴリを更新しました");
        } else {
            alert("エラー: " + result.error);
        }
    } catch (error) {
        console.error("カテゴリ更新エラー:", error);
        alert("カテゴリの更新に失敗しました");
    } finally {
        viewModel.set("isLoading", false);
    }
}

// 編集をキャンセル
export function onCancelEdit() {
    viewModel.set("isEditing", false);
    viewModel.set("editCategoryName", "");
    viewModel.set("editingCategoryId", null);
}

// カテゴリを削除
export async function onDeleteCategory(args) {
    const item = args.object.bindingContext;
    
    Dialogs.confirm({
        title: '確認',
        message: `「${item.name}」を削除しますか？`,
        okButtonText: 'はい',
        cancelButtonText: 'いいえ'
    }).then(async (confirmed) => {
        if (!confirmed) return;
        
        viewModel.set("isLoading", true);
        try {
            const result = await deleteCategory(item.id);
            if (result.success) {
                viewModel.categories.splice(0); // 配列をクリア
                await viewModel.loadCategories();
                alert("カテゴリを削除しました");
            } else {
                alert("削除を取り消しました");
            }
        } catch (error) {
            console.error("カテゴリ削除エラー:", error);
            alert("カテゴリの削除に失敗しました");
        } finally {
            viewModel.set("isLoading", false);
        }
    });
}
