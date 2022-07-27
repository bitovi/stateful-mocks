import { parse } from 'graphql';
import { RequestSpecifications } from '../interfaces/graphql';
import { getConfigRequestsNames } from '../services/request';
import { isQueryList, updateConfig } from '../utils/config';
import { getConfig, getSupportedRequests, getFile } from '../utils/graphql';

export const interceptNewRequest = async (
  request,
  _response,
  configFilePath,
  schemaFilePath
) => {
  if (request.body.query) {
    const parsedQuery: any = parse(request.body.query);
    //todo: refactor this; see why my utils doesn't work
    const requestName =
      parsedQuery.definitions[0].selectionSet.selections[0].name.value;
    const requestType = parsedQuery.definitions[0].operation;

    const supportedRequests: Array<RequestSpecifications> =
      getSupportedRequests(schemaFilePath);

    const { requests } = getConfig(configFilePath);
    const requestsNames = getConfigRequestsNames(requests);
    const isNewRequest = !requestsNames.includes(requestName);

    if (
      supportedRequests.some((request) => request.name === requestName) &&
      isNewRequest
    ) {
      const isList = isQueryList(
        requestName,
        requestType,
        getFile(schemaFilePath)
      );
      await updateConfig(
        request,
        requestName,
        requestType,
        configFilePath,
        schemaFilePath,
        isList
      );
    }
  }
};
