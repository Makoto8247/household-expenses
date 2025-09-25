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
            viewModel.categories.splice(0); // 既存の配列をクリア
            categories.forEach(categoryArray => {
            // 配列 [id, name, icon, color] をオブジェクトに変換
            const categoryObject = {
                id: categoryArray[0],
                name: categoryArray[1],
                icon: categoryArray[2],
                color: categoryArray[3]
            };
            viewModel.categories.push(categoryObject);
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
    
    return viewModel;
}
