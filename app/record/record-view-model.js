import { fromObject } from '@nativescript/core'
import { Dialogs } from '@nativescript/core'

import { SelectedPageService } from '../shared/selected-page-service'
import { getCategories, addExpense, getExpenses, deleteExpense } from '../db/db'

export function RecordViewModel() {
  SelectedPageService.getInstance().updateSelectedPage('Record')

  const viewModel = fromObject({
    isExpense: true,
    title: '',
    amount: '',
    description: '',
    categories: [],
    categoryNames: [],
    selectedCategoryIndex: 0,
    records: [],
    isLoading: false,

    async loadCategories() {
      try {
        const categories = await getCategories()
        this.set('categories', categories)
        const categoryNames = categories.map(cat => cat.name)
        this.set('categoryNames', categoryNames)
      } catch (error) {
        console.error('カテゴリ取得エラー:', error)
        await Dialogs.alert({
          title: 'エラー',
          message: 'カテゴリの取得に失敗しました',
          okButtonText: 'OK'
        })
      }
    },

    async loadRecords() {
      try {
        const expenses = await getExpenses(20)
        console.log('取得した支出データ:', JSON.stringify(expenses, null, 2))
        
        const formattedRecords = expenses.map(expense => {
          const record = {
            id: expense.id,
            title: expense.title,
            categoryName: expense.categoryName,
            categoryIcon: expense.categoryIcon,
            description: expense.description,
            amount: expense.amount,
            formattedAmount: (expense.expense ? '-' : '+') + '¥' + String(expense.amount),
            date: new Date(expense.date).toLocaleDateString('ja-JP'),
            isExpense: expense.expense
          }
          //console.log('フォーマット済み記録:', JSON.stringify(record, null, 2))
          return record
        })
        
        //console.log('全フォーマット済み記録:', JSON.stringify(formattedRecords, null, 2))
        this.set('records', formattedRecords)
      } catch (error) {
        console.error('記録取得エラー:', error)
      }
    },

    onExpenseTypeTap() {
      this.set('isExpense', true)
    },

    onIncomeTypeTap() {
      this.set('isExpense', false)
    },

    async onRecordTap() {
      // バリデーション
      if (!this.title || this.title.trim().length === 0) {
        await Dialogs.alert({
          title: 'エラー',
          message: 'タイトルを入力してください',
          okButtonText: 'OK'
        })
        return
      }

      if (this.title.trim().length > 20) {
        await Dialogs.alert({
          title: 'エラー',
          message: 'タイトルは20文字以内で入力してください',
          okButtonText: 'OK'
        })
        return
      }

      if (!this.amount || isNaN(this.amount) || parseFloat(this.amount) <= 0) {
        await Dialogs.alert({
          title: 'エラー',
          message: '正しい金額を入力してください',
          okButtonText: 'OK'
        })
        return
      }

      if (this.categories.length === 0) {
        await Dialogs.alert({
          title: 'エラー',
          message: 'カテゴリが設定されていません',
          okButtonText: 'OK'
        })
        return
      }

      this.set('isLoading', true)
      
      try {
        const selectedCategory = this.categories[this.selectedCategoryIndex]
        const result = await addExpense(
          this.isExpense,
          this.title.trim(),
          parseFloat(this.amount),
          selectedCategory.id,
          this.description || null
        )

        if (result.success) {
          await Dialogs.alert({
            title: '成功',
            message: '記録しました',
            okButtonText: 'OK'
          })
          
          // フォームをリセット
          this.set('title', '')
          this.set('amount', '')
          this.set('description', '')
          this.set('selectedCategoryIndex', 0)
          
          // 記録一覧を更新
          await this.loadRecords()
        } else {
          await Dialogs.alert({
            title: 'エラー',
            message: result.error || '記録に失敗しました',
            okButtonText: 'OK'
          })
        }
      } catch (error) {
        console.error('記録エラー:', error)
        await Dialogs.alert({
          title: 'エラー',
          message: '記録に失敗しました',
          okButtonText: 'OK'
        })
      } finally {
        this.set('isLoading', false)
      }
    },

    async onDeleteRecord(args) {
      const record = args.object.bindingContext
      
      const result = await Dialogs.confirm({
        title: '確認',
        message: 'この記録を削除しますか？',
        okButtonText: '削除',
        cancelButtonText: 'キャンセル'
      })
      
      if (result) {
        try {
          const deleteResult = await deleteExpense(record.id)
          if (deleteResult.success) {
            await this.loadRecords()
            await Dialogs.alert({
              title: '成功',
              message: '記録を削除しました',
              okButtonText: 'OK'
            })
          } else {
            await Dialogs.alert({
              title: 'エラー',
              message: deleteResult.error || '削除に失敗しました',
              okButtonText: 'OK'
            })
          }
        } catch (error) {
          console.error('削除エラー:', error)
          await Dialogs.alert({
            title: 'エラー',
            message: '削除に失敗しました',
            okButtonText: 'OK'
          })
        }
      }
    }
  })

  // 初期化時にデータを読み込み
  viewModel.loadCategories()
  viewModel.loadRecords()

  return viewModel
}

