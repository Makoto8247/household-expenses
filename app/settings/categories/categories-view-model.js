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
    viewModel.selectedIcon = ""; // 初期状態は空
    viewModel.editSelectedIcon = "";
    viewModel.showIconPicker = false;
    viewModel.isEditingIcon = false; // 編集時のアイコン選択モード
    
    // 絵文字アイコン一覧
    viewModel.iconList = new ObservableArray([
        "🏠", // 家
        "🚗", // 車
        "🍽️", // 食事
        "💡", // 電球
        "👕", // 衣服
        "🏥", // 医療
        "📚", // 本
        "👶", // 子供
        "🛒", // ショッピング
        "📁", // フォルダ
        "💰", // お金
        "☁️", // 雲
        "🌙", // 月
        "☀️", // 太陽
        "👤", // ユーザー
        "⚡", // 電気
        "🎵", // 音楽
        "🎮", // ゲーム
        "📱", // スマホ
        "✈️"  // 旅行
    ]);
    
    // 選択されたアイコンを表示する関数
    viewModel.getSelectedIconDisplay = function() {
        const selectedIcon = viewModel.get("selectedIcon");
        return selectedIcon || "";
    };
    
    // 編集中のアイコンを表示する関数
    viewModel.getEditIconDisplay = function() {
        const editIcon = viewModel.get("editSelectedIcon");
        return editIcon || "";
    };
    
    // カテゴリアイコンのUnicodeを取得する関数
    viewModel.getCategoryIconUnicode = function(code) {
        if (!code) return "";
        const icon = viewModel.iconList.find(item => item.code === code);
        return icon ? icon.unicode : "";
    };
    
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
        const icon = viewModel.get("selectedIcon");
        if (!name) {
            alert("カテゴリ名を入力してください");
            return;
        }
        
        viewModel.set("isLoading", true);
        try {
            const result = await addCategory(name, icon);
            if (result.success) {
                viewModel.set("newCategoryName", "");
                viewModel.set("selectedIcon", ""); // 空にリセット
                viewModel.categories.splice(0);
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
