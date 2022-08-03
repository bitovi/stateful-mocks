import { parse } from "graphql";
import { saveNewRequestInConfig } from "../utils/config";
import { getConfig, isSupportedRequest } from "../utils/graphql";
import { isNewRequest } from "../utils/graphql/request";

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

    const { requests } = getConfig(configFilePath);

    if (
      isSupportedRequest(requestName, schemaFilePath) &&
      isNewRequest(requests, request)
    ) {
      await saveNewRequestInConfig(
        request,
        requestName,
        requestType,
        configFilePath,
        schemaFilePath
      );
    }
  }
};
