import { parse } from 'graphql';
import { getConfigRequestsNames } from '../services/request';
import { updateConfig } from '../utils/config';
import { getConfig, getSupportedRequests } from '../utils/graphql';

export const interceptNewRequest = (request, _response, next) => {
  if (request.body.query) {
    const parsedQuery: any = parse(request.body.query);
    //todo: refactor this; see why my utils doesn't work
    const requestName =
      parsedQuery.definitions[0].selectionSet.selections[0].name.value;
    const requestType = parsedQuery.definitions[0].operation;

    const supportedRequests: any = getSupportedRequests();

    const { requests } = getConfig();
    const requestsNames = getConfigRequestsNames(requests);
    const isNewRequest = !requestsNames.includes(requestName);

    if (supportedRequests.includes(requestName) && isNewRequest) {
      updateConfig(request, requestName, requestType);
    }
  }
  return next();
};
