import api from "./apiCall.jsx";
import getEndpoint from "./endpoints.jsx";

export default async function handleModalApiCalls(requestFor, method, params = null, body = null) {
    // Determine HTTP method for axios
    const thisMethod =
        method === 'create' ? 'post' :
        method === 'update' ? 'put' :
        method === 'upload_pdf' ? 'post' :
        method === 'request-approval' ? 'post' :
        method === 'store' ? 'post' :
        method === 'dispatch' ? 'post' :
        method;

    // Prepare endpoint and parameters
    let thisParams = params;
    if (method === 'delete') {
        // Rebuild params object based on endpoint definitions
        const paramKeys = getEndpoint(requestFor, method, 'params', params) || [];
        thisParams = paramKeys.reduce((acc, key) => {
            if (params && params[key] !== undefined) {
                acc[key] = params[key];
            }
            return acc;
        }, {});
    }

    const thisEndpoint = getEndpoint(requestFor, method, 'url', thisParams);
    console.log('API Call:', method.toUpperCase(), thisEndpoint, 'params:', thisParams, 'body:', body);

    // Perform API call
    if (method === 'delete') {
        // axios.delete signature: delete(url, config)
        // pass data and params in config
        return await api.delete(thisEndpoint, { params: thisParams});
    } else {
        // axios.<method>(url, data, config)
        return await api[thisMethod](thisEndpoint, body, { params: thisParams });
    }
}
