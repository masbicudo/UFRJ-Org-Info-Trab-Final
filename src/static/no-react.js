/**
 * Include this script in your HTML to use JSX compiled code without React.
 */

const React = {
    createElement: function (tag, attrs, children) {
        if (typeof tag == "string") {
            var element = document.createElement(tag)

            for (let name in attrs) {
                if (name && attrs.hasOwnProperty(name)) {
                    let value = attrs[name]
                    if (value === true) {
                        element.setAttribute(name, true)
                    } else if (value !== false && value != null) {
                        element.setAttribute(name, value.toString())
                    }
                }
            }
            var args = Array.prototype.slice.call(arguments)
            args.shift()
            args.shift()
            while (args.length) {
                let child = args.shift()
                if (child === null || typeof child == "undefined" || child === false) continue
                if (Array.isArray(child)) {
                    args.unshift.apply(args, child)
                    continue
                }
                element.appendChild(
                    child.nodeType == null ?
                        document.createTextNode(child.toString()) : child)
            }
            return element
        }
        else if (tag instanceof Function) {
            return tag(Object.assign({}, attrs, {children: children}))
        }

        throw new Error("Invalid tag argument")
    }
}