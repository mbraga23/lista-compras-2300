'use client'

import { useState, useMemo, useEffect } from 'react'
import { meals, categoryColors, categoryEmoji, type ShoppingItem, type Category, type MealSection } from '@/lib/shopping-data'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ShoppingBasket, ChevronDown, ChevronUp, Filter, RotateCcw, Info, Check, ShoppingCart, Wallet, Package } from 'lucide-react'
import { toast } from 'sonner'

const STORAGE_KEY = 'shopping-list-state-v1'

interface ItemState {
  checked: boolean
  quantity: number
  price: number
}

type StateMap = Record<string, ItemState>

const ALL_CATEGORIES: Category[] = [
  'Proteínas', 'Laticínios', 'Carboidratos', 'Frutas', 'Vegetais',
  'Gorduras', 'Suplementos', 'Padaria', 'Bebidas', 'Outros'
]

export default function Home() {
  // Inicializa estado a partir do localStorage
  const [itemStates, setItemStates] = useState<StateMap>(() => {
    if (typeof window === 'undefined') return {}
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) return JSON.parse(saved)
    } catch {}
    return {}
  })

  const [activeFilter, setActiveFilter] = useState<Category | 'all'>('all')
  const [showOnlyUnbought, setShowOnlyUnbought] = useState(false)
  const [openMeals, setOpenMeals] = useState<Record<string, boolean>>(() => {
    const init: Record<string, boolean> = {}
    meals.forEach(m => { init[m.id] = true })
    return init
  })

  // Persiste no localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(itemStates))
    } catch {}
  }, [itemStates])

  const getItemState = (item: ShoppingItem): ItemState => {
    return itemStates[item.id] || { checked: false, quantity: item.quantity, price: item.price }
  }

  const toggleChecked = (itemId: string) => {
    const current = itemStates[itemId]
    const newChecked = !(current?.checked || false)
    setItemStates(prev => ({
      ...prev,
      [itemId]: {
        checked: newChecked,
        quantity: current?.quantity ?? 0,
        price: current?.price ?? 0,
      }
    }))
    if (newChecked) {
      toast.success('Item marcado como comprado!', { duration: 1500 })
    }
  }

  const updateQuantity = (itemId: string, quantity: number) => {
    const current = itemStates[itemId]
    setItemStates(prev => ({
      ...prev,
      [itemId]: {
        checked: current?.checked || false,
        quantity: isNaN(quantity) ? 0 : quantity,
        price: current?.price ?? 0,
      }
    }))
  }

  const updatePrice = (itemId: string, price: number) => {
    const current = itemStates[itemId]
    setItemStates(prev => ({
      ...prev,
      [itemId]: {
        checked: current?.checked || false,
        quantity: current?.quantity ?? 0,
        price: isNaN(price) ? 0 : price,
      }
    }))
  }

  const resetAll = () => {
    setItemStates({})
    toast.info('Lista reiniciada!')
  }

  // Cálculos
  const allItems = useMemo(() => meals.flatMap(m => m.items.map(i => ({ ...i, mealId: m.id, mealName: m.name }))), [])

  const stats = useMemo(() => {
    const total = allItems.length
    let bought = 0
    let totalCost = 0
    allItems.forEach(item => {
      const s = getItemState(item)
      if (s.checked) bought++
      totalCost += s.price || 0
    })
    return {
      total,
      bought,
      remaining: total - bought,
      progress: total > 0 ? (bought / total) * 100 : 0,
      totalCost,
    }
  }, [allItems, itemStates])

  // Verifica se um item passa pelo filtro
  const itemMatchesFilter = (item: ShoppingItem) => {
    if (activeFilter !== 'all' && item.category !== activeFilter) return false
    if (showOnlyUnbought && getItemState(item).checked) return false
    return true
  }

  // Verifica se uma refeição tem itens visíveis
  const mealHasVisibleItems = (meal: MealSection) => {
    return meal.items.some(itemMatchesFilter)
  }

  const formatCurrency = (value: number) => {
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
  }

  return (
    <TooltipProvider delayDuration={200}>
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
        <div className="max-w-5xl mx-auto px-3 sm:px-4 py-4 sm:py-6 pb-24">

          {/* Header */}
          <header className="mb-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center shadow-lg shadow-orange-500/30">
                <ShoppingBasket className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-50">
                  Lista de Compras Mensal
                </h1>
                <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                  Plano Nutricional Tático · 2300 kcal · 6 refeições · 30 dias
                </p>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-3 gap-2 sm:gap-3 mt-4">
              <Card className="border-0 shadow-sm bg-white/80 dark:bg-gray-900/80 backdrop-blur">
                <CardContent className="p-3 sm:p-4">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-950 flex items-center justify-center flex-shrink-0">
                      <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide font-medium">Progresso</p>
                      <p className="text-sm sm:text-base font-bold text-gray-900 dark:text-gray-50 truncate">
                        {stats.bought}/{stats.total}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-sm bg-white/80 dark:bg-gray-900/80 backdrop-blur">
                <CardContent className="p-3 sm:p-4">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-orange-100 dark:bg-orange-950 flex items-center justify-center flex-shrink-0">
                      <Package className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide font-medium">Faltam</p>
                      <p className="text-sm sm:text-base font-bold text-gray-900 dark:text-gray-50 truncate">
                        {stats.remaining} itens
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-sm bg-white/80 dark:bg-gray-900/80 backdrop-blur">
                <CardContent className="p-3 sm:p-4">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-950 flex items-center justify-center flex-shrink-0">
                      <Wallet className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide font-medium">Total</p>
                      <p className="text-sm sm:text-base font-bold text-gray-900 dark:text-gray-50 truncate">
                        {formatCurrency(stats.totalCost)}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Progress bar */}
            <div className="mt-3">
              <Progress value={stats.progress} className="h-2 bg-orange-100 dark:bg-orange-950" />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1.5 text-right">
                {stats.progress.toFixed(0)}% concluído
              </p>
            </div>
          </header>

          {/* Filters */}
          <Card className="border-0 shadow-sm bg-white/90 dark:bg-gray-900/90 backdrop-blur mb-4 sticky top-2 z-20">
            <CardContent className="p-3 sm:p-4">
              <div className="flex items-center justify-between gap-2 mb-3">
                <div className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                  <Filter className="w-4 h-4" />
                  Filtros
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowOnlyUnbought(!showOnlyUnbought)}
                    className={`h-8 text-xs ${showOnlyUnbought ? 'bg-orange-100 border-orange-300 text-orange-700 dark:bg-orange-950 dark:border-orange-800 dark:text-orange-300' : ''}`}
                  >
                    {showOnlyUnbought ? 'Mostrando não comprados' : 'Só não comprados'}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={resetAll}
                    className="h-8 text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                  >
                    <RotateCcw className="w-3 h-3 mr-1" />
                    Reiniciar
                  </Button>
                </div>
              </div>

              <div className="flex flex-wrap gap-1.5">
                <button
                  onClick={() => setActiveFilter('all')}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all border ${
                    activeFilter === 'all'
                      ? 'bg-gray-900 text-white border-gray-900 dark:bg-gray-100 dark:text-gray-900 dark:border-gray-100'
                      : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700 dark:hover:bg-gray-700'
                  }`}
                >
                  Todas
                </button>
                {ALL_CATEGORIES.map(cat => {
                  const isActive = activeFilter === cat
                  const count = allItems.filter(i => i.category === cat).length
                  if (count === 0) return null
                  return (
                    <button
                      key={cat}
                      onClick={() => setActiveFilter(cat)}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all border flex items-center gap-1 ${
                        isActive
                          ? 'ring-2 ring-offset-1 ' + categoryColors[cat]
                          : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700 dark:hover:bg-gray-700'
                      }`}
                    >
                      <span>{categoryEmoji[cat]}</span>
                      {cat}
                      <span className="opacity-60">({count})</span>
                    </button>
                  )
                })}
              </div>
            </CardContent>
          </Card>

          {/* Meal Sections */}
          <div className="space-y-3">
            {meals.map(meal => {
              if (!mealHasVisibleItems(meal)) return null
              const isOpen = openMeals[meal.id]
              const visibleItems = meal.items.filter(itemMatchesFilter)
              const mealBought = visibleItems.filter(i => getItemState(i).checked).length
              const mealTotal = visibleItems.length

              return (
                <Card key={meal.id} className="border-0 shadow-sm bg-white dark:bg-gray-900 overflow-hidden">
                  <Collapsible
                    open={isOpen}
                    onOpenChange={(open) => setOpenMeals(prev => ({ ...prev, [meal.id]: open }))}
                  >
                    <CollapsibleTrigger asChild>
                      <button className="w-full text-left">
                        <CardHeader className="p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                          <div className="flex items-center justify-between gap-3">
                            <div className="flex items-center gap-3 min-w-0 flex-1">
                              <span className="text-2xl flex-shrink-0">{meal.emoji}</span>
                              <div className="min-w-0 flex-1">
                                <CardTitle className="text-base sm:text-lg flex items-center gap-2">
                                  {meal.name}
                                  <Badge variant="secondary" className="text-[10px] font-normal">
                                    {mealBought}/{mealTotal}
                                  </Badge>
                                </CardTitle>
                                <CardDescription className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 truncate">
                                  {meal.target}
                                </CardDescription>
                              </div>
                            </div>
                            <div className="flex items-center gap-2 flex-shrink-0">
                              {isOpen ? (
                                <ChevronUp className="w-4 h-4 text-gray-400" />
                              ) : (
                                <ChevronDown className="w-4 h-4 text-gray-400" />
                              )}
                            </div>
                          </div>
                        </CardHeader>
                      </button>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <CardContent className="p-0">
                        <div className="px-4 pb-2 pt-1">
                          <p className="text-xs text-gray-500 dark:text-gray-400 italic">
                            {meal.description}
                          </p>
                        </div>
                        <ul className="divide-y divide-gray-100 dark:divide-gray-800">
                          {visibleItems.map(item => {
                            const state = getItemState(item)
                            return (
                              <li
                                key={item.id}
                                className={`px-3 sm:px-4 py-3 transition-colors ${
                                  state.checked ? 'bg-emerald-50/50 dark:bg-emerald-950/20' : 'hover:bg-gray-50 dark:hover:bg-gray-800/30'
                                }`}
                              >
                                <div className="flex items-start gap-3">
                                  {/* Checkbox */}
                                  <button
                                    onClick={() => toggleChecked(item.id)}
                                    className="mt-0.5 flex-shrink-0"
                                    aria-label={state.checked ? 'Desmarcar item' : 'Marcar como comprado'}
                                  >
                                    <div className={`w-6 h-6 rounded-md border-2 flex items-center justify-center transition-all ${
                                      state.checked
                                        ? 'bg-emerald-500 border-emerald-500'
                                        : 'border-gray-300 hover:border-emerald-400 dark:border-gray-600 dark:hover:border-emerald-400'
                                    }`}>
                                      {state.checked && <Check className="w-4 h-4 text-white" />}
                                    </div>
                                  </button>

                                  {/* Item info */}
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-start justify-between gap-2 flex-wrap">
                                      <div className="min-w-0 flex-1">
                                        <div className="flex items-center gap-2 flex-wrap">
                                          <span className={`font-medium text-sm sm:text-base ${
                                            state.checked ? 'line-through text-gray-400 dark:text-gray-500' : 'text-gray-900 dark:text-gray-100'
                                          }`}>
                                            {item.name}
                                          </span>
                                          <Badge variant="outline" className={`text-[10px] ${categoryColors[item.category]}`}>
                                            {categoryEmoji[item.category]} {item.category}
                                          </Badge>
                                        </div>

                                        {/* Quantity & Price inputs */}
                                        <div className="flex items-center gap-2 mt-2 flex-wrap">
                                          <div className="flex items-center gap-1">
                                            <label className="text-xs text-gray-500 dark:text-gray-400">Qtd:</label>
                                            <Input
                                              type="number"
                                              value={state.quantity}
                                              onChange={(e) => updateQuantity(item.id, parseFloat(e.target.value))}
                                              className="h-8 w-20 text-sm"
                                              min="0"
                                              step="any"
                                            />
                                            <span className="text-xs text-gray-500 dark:text-gray-400">{item.unit}</span>
                                          </div>
                                          <div className="flex items-center gap-1">
                                            <label className="text-xs text-gray-500 dark:text-gray-400">R$:</label>
                                            <Input
                                              type="number"
                                              value={state.price}
                                              onChange={(e) => updatePrice(item.id, parseFloat(e.target.value))}
                                              placeholder="0,00"
                                              className="h-8 w-24 text-sm"
                                              min="0"
                                              step="0.01"
                                            />
                                          </div>
                                        </div>

                                        {/* Tip & substitutes */}
                                        {(item.tip || item.substitutes) && (
                                          <div className="mt-2 space-y-1">
                                            {item.tip && (
                                              <div className="flex items-start gap-1.5 text-xs text-gray-500 dark:text-gray-400">
                                                <Info className="w-3 h-3 mt-0.5 flex-shrink-0 text-blue-400" />
                                                <span className="leading-relaxed">{item.tip}</span>
                                              </div>
                                            )}
                                            {item.substitutes && item.substitutes.length > 0 && (
                                              <div className="flex items-start gap-1.5 text-xs">
                                                <span className="text-gray-400 dark:text-gray-500 mt-0.5">Substitutos:</span>
                                                <div className="flex flex-wrap gap-1">
                                                  {item.substitutes.map(sub => (
                                                    <span key={sub} className="px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 text-[11px]">
                                                      {sub}
                                                    </span>
                                                  ))}
                                                </div>
                                              </div>
                                            )}
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </li>
                            )
                          })}
                        </ul>
                      </CardContent>
                    </CollapsibleContent>
                  </Collapsible>
                </Card>
              )
            })}
          </div>

          {/* Empty state when filter has no matches */}
          {meals.every(m => !mealHasVisibleItems(m)) && (
            <Card className="border-0 shadow-sm bg-white dark:bg-gray-900">
              <CardContent className="p-8 text-center">
                <ShoppingCart className="w-10 h-10 mx-auto text-gray-300 dark:text-gray-600 mb-2" />
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Nenhum item encontrado com os filtros atuais.
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-3"
                  onClick={() => { setActiveFilter('all'); setShowOnlyUnbought(false) }}
                >
                  Limpar filtros
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Floating Total Bar */}
          <div className="fixed bottom-0 left-0 right-0 z-30 bg-white/95 dark:bg-gray-900/95 backdrop-blur border-t border-gray-200 dark:border-gray-800 shadow-lg">
            <div className="max-w-5xl mx-auto px-3 sm:px-4 py-3 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center flex-shrink-0">
                  <ShoppingBasket className="w-5 h-5 text-white" />
                </div>
                <div className="min-w-0">
                  <p className="text-[11px] text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                    {stats.bought} de {stats.total} itens
                  </p>
                  <p className="text-base sm:text-lg font-bold text-gray-900 dark:text-gray-50 truncate">
                    {formatCurrency(stats.totalCost)}
                  </p>
                </div>
              </div>
              <Button
                size="sm"
                onClick={resetAll}
                variant="outline"
                className="flex-shrink-0"
              >
                <RotateCcw className="w-3.5 h-3.5 mr-1" />
                Reiniciar
              </Button>
            </div>
          </div>

          {/* Footer info */}
          <footer className="mt-6 pt-6 pb-2 text-center">
            <p className="text-xs text-gray-400 dark:text-gray-500">
              Baseado no Plano Nutricional Tático 2300 kcal · Lista para 30 dias
            </p>
            <p className="text-[11px] text-gray-300 dark:text-gray-600 mt-1">
              Suas alterações são salvas automaticamente neste dispositivo
            </p>
          </footer>
        </div>
      </div>
    </TooltipProvider>
  )
}
