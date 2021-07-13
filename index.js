// Type-Shield Main File
import global_handler from './base.js'

// Simpler ways to access the main functionality
export function isValid ( riskyObject, template ) {
    const assessed = assessObject( riskyObject, template)
    return assessed.valid
}

export function isInvalid ( riskyObject, template) {
    const assessed = assessObject( riskyObject, template)
    return ! assessed.valid
} 

// Register extra handlers for expandability
export function registerHandler ( keywordName, handler ) {

    if ( keywordName in global_handler )
        console.warn(`Template ${keywordName} already exists, overwriting`)

    global_handler[ keywordName ] = handler

}

// Run this module
export function assessObject ( riskyObject, template ) {

    try {

        // Sanity checks
        if ( template === riskyObject )
            return { valid: true }

        // Null case
        if ( template === null || template === undefined)
            return { valid: false, result :"Should be null" }
        if ( riskyObject === null || riskyObject === undefined )
            return { valid: false, result : "Should not be null" }

        // Grab keys & object states
        const templateKeys = Object.keys( template )
        const objectKeys = Object.keys( riskyObject )
        const templateIsObject = typeof template === 'object'
        const objectIsObject = typeof riskyObject === 'object'

        // If neigher are objects yet they dont equal, failure
        if ( ! templateIsObject ) 
            return { valid: false, result : `Should be ${template}` }

        // If only template is an object, either the object is wrong or the template is pure
        if ( templateIsObject && !objectIsObject ) {

            // Empty template yet object is not object
            if ( templateKeys.length == 0 )
                return { valid: false, result : `Should be empty object` }
            
            // Check if keys are templates, if not, object is wrong
            if ( templateKeys[0][0] !== '_' )
                return { valid: false, result : `Should be an object` }

            // Ok, so template is defining a non-object value, check it out
            for ( let i in templateKeys ){
                const tk = templateKeys[i]

                // Does template value exist?
                if ( ! ( tk in global_handler ))
                    return { valid: false, result : `Unknown handler for ${tk}` }

                // Run item through handler
                const handler = global_handler[tk]
                const _result = handler( riskyObject, template[tk] )

                if ( _result )
                    return { valid: false, result : _result }

            }

            // Everything checks out agains this
            return { valid : true }

        }

        // Both are objects, check if this layer is pure or templated
        if ( templateIsObject && objectIsObject ) {

            // Going element wise here
            let result = {}
            let valid = true

            // Empty template and object, match
            if ( templateKeys.length == 0 && objectKeys.length == 0)
                return { valid: true }

            // Empty template yet object is not empty
            if ( templateKeys.length == 0 && objectKeys.length != 0)
                return { valid: true, result : 'Should be empty object' }

            // Check if keys are templates, if not, compare object sub-items
            if ( templateKeys[0][0] !== '_' ) {

                // Go through template keys
                for ( let i in templateKeys ){
                    const tk = templateKeys[i]

                    // No match
                    if ( ! (tk in riskyObject) ){
                        result[tk] = 'Missing from object',
                        valid = false
                    }

                    // Found match?
                    else {
                        const _result = assessObject( riskyObject[tk], template[tk] )
                        if ( _result.result ) result[tk] = _result.result
                        valid = valid && _result.valid
                    }
                }

                // Go through object fro extras
                for ( let i in objectKeys ){
                    const ok = objectKeys[i] 
                    
                    if ( !( ok in template )){
                        result[ok] = 'Extra value',
                        valid = false
                    }

                }

                return { valid, result }
            }

            // If keys are templates, apply them as before
            for ( let i in templateKeys ){
                const tk = templateKeys[i]

                // Does template value exist?
                if ( ! ( tk in global_handler ))
                    return { valid: false, result : `Unknown handler for ${tk}` }

                // Run item through handler
                const handler = global_handler[tk]
                const _result = handler( riskyObject, template[tk] )
        
                if ( ! _result ) continue 

                if ( typeof _result === 'string' ){
                    valid = false,
                    result = _result
                }
                else {
                    valid = _result.valid && valid
                    result = _result.result
                }
                    
            }

            return { valid, result }
        }
    } catch (e){
        return { valid : false, result : "Unknown Error" }
    }

}


export default { isInvalid, isValid, registerHandler, assessObject }