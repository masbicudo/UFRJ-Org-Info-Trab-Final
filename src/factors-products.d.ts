interface FactorItem {
    name: string
    value: number
    unit: string
}
interface FactorGroup {
    title: string
    items: FactorItem[]
}
interface Factors {
    groups: FactorGroup[]
}

interface ProductFactor {
    name: string
    value: number
    [index: string]: any
}
interface Product {
    name: string
    factors: ProductFactor[]
}
