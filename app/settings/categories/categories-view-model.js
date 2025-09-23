import { Observable, ObservableArray } from "@nativescript/core";
import { getCategories, addCategory, deleteCategory, updateCategory } from "../../db/db";

export function createViewModel() {
    const viewModel = new Observable();
    
    viewModel.categories = new ObservableArray();
    viewModel.newCategoryName = "";
    viewModel.isLoading = false;
    viewModel.isEditing = false;
    viewModel.editCategoryName = "";
    viewModel.editingCategoryId = null;
    
    viewModel.initialize = async function() {
        viewModel.set("isLoading", true);
        try {
            await viewModel.loadCategories();
        } catch (error) {
            console.error("カテゴリ読み込みエラー:", error);
            alert("カテゴリの読み込みに失敗しました");
        } finally {
            viewModel.set("isLoading", false);
        }
    };
    
    // カテゴリ一覧を読み込み
    viewModel.loadCategories = async function() {
        try {
            const categories = await getCategories();
            viewModel.categories.splice(0);
            categories.forEach(category => {
                viewModel.categories.push(category);
            });
        } catch (error) {
            console.error("カテゴリの読み込みエラー:", error);
            alert("カテゴリの読み込みに失敗しました");
        }
    };
    
    // カテゴリを追加
    viewModel.addCategory = async function() {
        const name = viewModel.get("newCategoryName").trim();
        if (!name) {
            alert("カテゴリ名を入力してください");
            return;
        }
        
        viewModel.set("isLoading", true);
        try {
            const result = await addCategory(name);
            if (result.success) {
                viewModel.set("newCategoryName", "");
                await viewModel.loadCategories();
                alert("カテゴリを追加しました");
            } else {
                alert("エラー: " + result.error);
            }
        } catch (error) {
            console.error("カテゴリ追加エラー:", error);
            alert("カテゴリの追加に失敗しました");
        } finally {
            viewModel.set("isLoading", false);
        }
    };
    
    // カテゴリを編集
    viewModel.editCategory = function(args) {
        const item = args.object.bindingContext;
        viewModel.set("editingCategoryId", item.id);
        viewModel.set("editCategoryName", item.name);
        viewModel.set("isEditing", true);
    };
    
    // 編集を保存
    viewModel.saveCategory = async function() {
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
    };
    
    // 編集をキャンセル
    viewModel.cancelEdit = function() {
        viewModel.set("isEditing", false);
        viewModel.set("editCategoryName", "");
        viewModel.set("editingCategoryId", null);
    };
    
    // カテゴリを削除
    viewModel.deleteCategory = async function(args) {
        const item = args.object.bindingContext;
        
        const confirmed = confirm(`「${item.name}」を削除しますか？`);
        if (!confirmed) return;
        
        viewModel.set("isLoading", true);
        try {
            const result = await deleteCategory(item.id);
            if (result.success) {
                await viewModel.loadCategories();
                alert("カテゴリを削除しました");
            } else {
                alert("削除エラー: " + result.error);
            }
        } catch (error) {
            console.error("カテゴリ削除エラー:", error);
            alert("カテゴリの削除に失敗しました");
        } finally {
            viewModel.set("isLoading", false);
        }
    };
    
    return viewModel;
}
