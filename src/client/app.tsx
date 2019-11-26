addEventListener("load", async () => {
    const btnAddProd = document.getElementById("btnAddProd") as HTMLButtonElement?
    const listaProds = document.getElementById("listaProds")
    const selectItems = document.getElementById("selectItems") as HTMLSelectElement?

    if (!(btnAddProd && listaProds && selectItems))
        return

    btnAddProd.addEventListener("click", async (ev) => {
        const val = parseInt(selectItems.value)
        if (val > 0) {
            const item_repsponse = await fetch("/api/item/" + val)
            const item_contentType = item_repsponse.headers.get("content-type");
            if (contentType && contentType.indexOf("application/json") !== -1) {
                const json = await item_repsponse.json()
                console.log(json)
                listaProds.classList.remove("hidden")
                listaProds.appendChild(
                    <div class="card" style="width: 18rem; display: inline-block; margin: 5px;">
                        <div class="card-body">
                            <h5 class="card-title">{json.name}</h5>
                            <p class="card-text">Características</p>
                            <button class="btn btn-danger">Remover da lista</button>
                        </div>
                    </div>
                )
            }
        }
        else if (val == 0) {
            listaProds.classList.remove("hidden")
            const elProps = (<div class="props"></div>) as HTMLElement
            const btnAddProp = (<button class="btn btn-sm btn-secondary">Nova propriedade</button>) as HTMLButtonElement
            btnAddProp.addEventListener("click", () => {
                elProps.appendChild(
                    <div>
                        <select><option value="">(selectione um tipo)</option></select> <input type="text" />
                    </div>
                )
            })
            listaProds.appendChild(
                <div class="card" style="width: 18rem; display: inline-block; margin: 5px;">
                    <div class="card-body">
                        <h5 class="card-title" contentEditable="true" placeholder="Título do produto"></h5>
                        <div class="detalhes">
                            <p class="card-text">Características</p>
                            {elProps}
                            {btnAddProp}
                        </div>
                        <button class="btn btn-primary">Salvar</button>
                    </div>
                </div>
            )
        }
    })

    const response = await fetch("/api/items")
    const contentType = response.headers.get("content-type");
    if (contentType && contentType.indexOf("application/json") !== -1) {
        const json = await response.json()
        console.log(json)
        selectItems.appendChild(<option value="0">[Adicionar novo produto]</option>)
        for (var k in json) {
            const index = parseInt(k) + 1
            const name = json[k]
            selectItems.appendChild(<option value={index}>{name}</option>)
        }
    }

    $(selectItems).selectpicker('refresh')
})