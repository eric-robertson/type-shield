import { assessObject } from './index.js'

export default {

    /*
            Basic Types
    */

    // Verify that the item is a string
    // Defined is a length or limit
    // Item is a string of given length or up to limit length
    _string ( item, definition ) {
        
        const { length, limit, min } = definition

        if ( !( typeof item === 'string' ))
            return 'Not a string'

        if ( length && item.length != length )
            return `String must be ${length} long`

        if ( limit && item.length > limit )
            return `String is too long, limit: ${limit}`

        if ( min && item.length < min )
            return `String is too short, required: ${limit}`

    },

    // Verify the item is an integer
    // Defined is a given max or min
    // Item is an integer within that range
    _int ( item, definition ) {

        const { max, min, positive, cast } = definition

        if ( cast ) { 
            item = +item
        }

        if ( ! Number.isInteger( item ) )
            return 'Not an integer'

        if ( positive && item < 0)
            return 'Number must be positive'

        if ( max && item > max )
            return `Number too large, max: ${max}`

        if ( min && item < min )
            return `Number too small, min: ${min}`

    },

    /*
            Compound Types
    */

    // Verify item exists in list that is definition
    // Defined is a list of objects
    // Item is contained in that list
    _oneOf ( item, definition ) {

        let errors = []

        for ( let i in definition ){
            const def = definition[i]
            const result = assessObject( item, def )

            if ( result.valid ) return
            errors.push( result.result )
        }

        return { valid : false, result : errors }
        
    },

    // Verify object is an array of items matching templates
    // Defined is a list of templates
    // Item is a list of items matching templates
    _arrayLike ( item, definition ) {

        if ( !Array.isArray( item ))
            return `Item expected to be array`

        const result = {}
        let valid = true
        for ( let i in item ){

            const itemResult = assessObject(item[i], definition)
            if ( itemResult.valid ) continue

            result[i] = itemResult.result
            valid = false
        }

        if ( ! valid )
            return { valid, result }
            

    },

    // Verify object structure matches template
    // Defined is keys and value checks
    // Item is an object with keys and values
    _mapLike ( item, definition ) {

        if ( typeof item !== 'object' )
            return 'Item expected to be object'
        if ( item === null)
            return 'Item unexpectedly null'

        const {key, value} = definition
        const keys = Object.keys( item )
        let valid = true
        const errors = {}

        for ( let i in keys ) {

            const obj_key = keys[i]
            const obj_value = item[obj_key]

            const result = assessObject(obj_key, key)
            if (!result.valid) {
                valid = false
                errors[obj_key] = { key : result.result }
            }

            const result2 = assessObject( obj_value, value )
            if (!result2.valid) {
                valid = false
                if ( !errors[obj_value] )
                    errors[obj_value] = {}
                errors[obj_key]['value'] = result2.result
            }

        }

        if ( ! valid )
            return { valid, result : errors }

    }




}