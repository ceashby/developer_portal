export let RequiredNullPropTypes = {
    number: nullOrPropType("number"),
    object: nullOrPropType("object"),
    func: nullOrPropType("func"),
    string: nullOrPropType("string"),
    bool: nullOrPropType("boolean")
}

function nullOrPropType(typeName) {
    return function(props, propName, componentName) {
        const propValue = props[propName]
        if (propValue === null) return
        if (typeof propValue === typeName) return
        return new Error(
            `${componentName} ${propName} only accepts null or ${typeName} but its value is ${propValue}`
        )
    }
}
