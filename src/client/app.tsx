type CRUDHandler = (target: HTMLElement, action: string, index: number, prod: Product) => void

function Card(props: { editable?: boolean, index?: number, data: Product, factors: Factors, onCRUD?: CRUDHandler }) {
    var el_title: HTMLElement
    var el_propsContainer: HTMLElement
    var btnAddProp: HTMLButtonElement | null
    var btn_save = null as HTMLButtonElement | null
    var btn_cancel_edit = null as HTMLButtonElement | null
    var btn_edit_mode = null as HTMLButtonElement | null
    var btn_remove = null as HTMLButtonElement | null
    const product = Object.assign({ name: "", factors: [] } as Product, props.data)

    const el_card = (
        <div class="prod-card">
            <div class="card-body">
                {el_title = <h5 class="card-title" contentEditable={props.editable} placeholder={props.editable && "[Entre com o título do produto]"}>{props.data.name}</h5>}
                <p class="card-text">Características</p>
                <div class="container detalhes">
                    {el_propsContainer = <div class="props"></div>}
                    {btnAddProp = props.editable ? (<button class="btn btn-sm btn-secondary" style="width:100%">Nova característica</button>) as HTMLButtonElement : null}
                </div>
                {props.editable
                    ? (<div class="input-group">
                        {btn_save = <button class="form-control btn btn-primary">Salvar</button>}
                        {btn_cancel_edit = <button class="form-control btn btn-danger">Cancelar</button>}
                    </div>
                    )
                    : (<div class="input-group">
                        {btn_edit_mode = <button class="form-control btn btn-primary">Modo de edição</button>}
                        {btn_remove = <button class="form-control btn btn-danger">Remover da lista</button>}
                    </div>)}
            </div>
        </div>
    )
    
    el_title.addEventListener("input", () => {
        product.name = el_title.innerText.trim()
    })

    var total = 0
    for (var p of props.data.factors) {
        const item = props.factors.groups.reduce(
            (acc: FactorItem | null, grp: FactorGroup) => 
                acc
                || grp.items.filter(item => item.name == p.name)[0]
                || null,
                null)
        
        if (!item) continue

        if (props.editable) {
            const factor = p
            el_propsContainer.appendChild(
                <EditProp editable data={p} factors={props.factors} onChange={(target, action, property, value) => {
                    if (action == "remove") {
                        let index = product.factors.indexOf(factor)
                        if (index >= 0) product.factors.splice(index, 1)    
                    }
                    if (action == "change" && property) {
                        factor[property] = value
                    }
                }} />
            )
        }
        else {
            total += item.value * p.value
            el_propsContainer.appendChild(
                <div style="margin-bottom: 4px">
                    <span class="name">{item.name}:</span> <span class="value">{p.value}</span> <span>{item.unit}</span> * ( <span class="value">{item.value}</span> <sup>kgCO<sup>2</sup>e</sup>/<sub>{item.unit}</sub> ) = <span class="value">{(item.value * p.value).toFixed(3)}</span> kgCO<sup>2</sup>e
                </div>
            )
        }
    }

    if (!props.editable) {
        el_propsContainer.appendChild(
            <div style="margin-bottom: 4px; font-weight: bold; font-size: 1.2em">
                <span class="name">Total:</span> <span class="value">{total.toFixed(3)}</span> kgCO<sup>2</sup>e
            </div>
        )
    }

    btn_save?.addEventListener("click", async () => {
        console.log(product)
        if (props.index) {
            const rawResponse = await fetch('/api/item/' + props.index, {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(product)
            });

            if (rawResponse.ok) {
                props.onCRUD?.call(null, el_card, "update", props.index, product)
                el_card.replaceWith(<Card index={props.index} data={product} factors={props.factors} onCRUD={props.onCRUD} />)
            }
        }
        else {
            const rawResponse = await fetch('/api/items', {
                method: 'PUT',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(product)
            });

            const content = await rawResponse.json();

            console.log(content);
            if (rawResponse.ok && content.id) {
                props.onCRUD?.call(null, el_card, "create", content.id, product)
                el_card.replaceWith(<Card index={content.id} data={product} factors={props.factors} onCRUD={props.onCRUD} />)
            }
        }
    })

    btn_cancel_edit?.addEventListener("click", () => {
        if (props.index)
            el_card.replaceWith(<Card index={props.index} data={props.data} factors={props.factors} onCRUD={props.onCRUD} />)
        else
            el_card.remove()
    })

    btn_edit_mode?.addEventListener("click", () => {
        el_card.replaceWith(<Card editable index={props.index} data={props.data} factors={props.factors} onCRUD={props.onCRUD} />)
    })

    btn_remove?.addEventListener("click", () => {
        el_card.remove()
    })

    btnAddProp?.addEventListener("click", () => {        
        var factor = { name: "", value: NaN } as ProductFactor
        product.factors.push(factor)
        el_propsContainer.appendChild(<EditProp data={factor} factors={props.factors} onChange={(target, action, property, value) => {
            if (action == "remove") {
                let index = product.factors.indexOf(factor)
                if (index >= 0) product.factors.splice(index, 1)    
            }
            if (action == "change" && property) {
                factor[property] = value
            }
        }} />)
    })
    return el_card
}

function EditProp(props: { editable?: boolean, data?: ProductFactor, factors: Factors, onChange: ((el: HTMLElement, action: string, property?: string, new_value?: any) => void) }) {
    var el_select: HTMLSelectElement
    var btn_remove: HTMLButtonElement
    var el_prop: HTMLElement
    var el_unit: HTMLElement
    var el_value: HTMLInputElement
    console.log(props.factors)

    const sel_item = props.data?.name
        ? props.factors.groups.reduce(
            (acc: FactorItem | null, grp: FactorGroup) =>
                acc
                || grp.items.filter(item => item.name == props.data?.name)[0]
                || null,
            null)
        : null

    const list_options = props.factors.groups.map(
            grp => <optgroup label={grp.title}>{grp.items.map(
                item => <option
                    value={item.name}
                    selected={item ? sel_item?.name == item.name : false}
                        data-content={(<div><span class="name">{item.name}</span> ( <span class="value">{item.value}</span> <sup>kgCO<sup>2</sup>e</sup>/<sub>{item.unit}</sub> )</div>).innerHTML}
                        title={item.name}
                    ></option>
        )}</optgroup>)

    el_prop = <div class="input-group input-group-sm" style="margin-bottom: 4px">
        {btn_remove = <button class="form-control btn btn-danger" style="max-width:2em">x</button>}
        <div class="form-control form-control-selectpicker" style="width: 10em">
            {el_select = <select data-live-search="true" data-width="auto" class="selectpicker" title="Selecione uma característica ...">
                {list_options}
            </select>}
        </div>
        {el_value = <input type="text" class="form-control" value={props.data?.value} />}
        <div class="input-group-append">{el_unit = <span class="input-group-text">{sel_item?.unit ?? "?"}</span>}</div>
    </div>

    btn_remove.addEventListener("click", () => {
        $(el_select).selectpicker("destroy")
        el_prop.remove()
        props.onChange?.call(null, el_prop, "remove")
    })

    el_select.addEventListener("change", ev => {
        const factorItem = props.factors.groups.reduce(
            (acc: FactorItem | null, cur: FactorGroup) =>
                acc
                || cur.items.filter(item => item.name == (ev.target as HTMLSelectElement | null)?.value)[0]
                || null,
                null)
        el_unit.innerText = factorItem?.unit ?? ""
        props.onChange?.call(null, el_prop, "change", "name", factorItem?.name ?? "")
    })
    $(el_select).selectpicker()

    el_value.addEventListener("change", () => {
        props.onChange?.call(null, el_prop, "change", "value", parseFloat(el_value.value))
    })

    return el_prop
}

async function addProduct(ev: MouseEvent, listaProds: HTMLElement, selectItems: HTMLSelectElement, factors: Factors) {
    const val = parseInt(selectItems.value)

    const handleCRUD: CRUDHandler = (target, action, index, prod) => {
        if (action == "save") {
            selectItems.appendChild(<option value={index}>{prod.name}</option>)
            $(selectItems).selectpicker('refresh')
        }
        if (action == "delete") {
            selectItems.querySelector("option[value='"+index+"']")?.remove()
            $(selectItems).selectpicker('refresh')
        }
    }

    if (val > 0) {
        const item_repsponse = await fetch("/api/item/" + val)
        const item_contentType = item_repsponse.headers.get("content-type");
        if (item_contentType && item_contentType.indexOf("application/json") !== -1) {
            const json = await item_repsponse.json()
            console.log(json)
            listaProds.classList.remove("hidden")
            listaProds.appendChild(<Card index={val} data={json} factors={factors} onCRUD={handleCRUD} />)
        }
    }
    else if (val == 0) {
        listaProds.classList.remove("hidden")
        listaProds.appendChild(<Card editable data={{ name: "", factors: [] }} factors={factors} onCRUD={handleCRUD} />)
    }
}

addEventListener("load", async () => {
    const btnAddProd = document.getElementById("btnAddProd") as HTMLButtonElement|null
    const listaProds = document.getElementById("listaProds")
    const selectItems = document.getElementById("selectItems") as HTMLSelectElement|null

    if (!(btnAddProd && listaProds && selectItems))
        return

    const factors_request = await fetch("/api/factors")
    const factors = await factors_request.json() as Factors|null

    if (!(factors))
        return

    btnAddProd.addEventListener("click", async ev => await addProduct(ev, listaProds, selectItems, factors))

    const response = await fetch("/api/items")
    const contentType = response.headers.get("content-type");
    if (contentType && contentType.indexOf("application/json") !== -1) {
        const json = await response.json()
        console.log(json)
        selectItems.appendChild(<option value="0">[Adicionar novo produto]</option>)
        for (var k in json) {
            const index = parseInt(k) + 1
            const name = json[k]
            if (name)
                selectItems.appendChild(<option value={index}>{name}</option>)
        }
    }

    $(selectItems).selectpicker('refresh')
})