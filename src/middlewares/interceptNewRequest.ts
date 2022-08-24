import { parse } from "graphql";
import { saveNewRequestInConfig } from "../utils/config";
import { getConfig, isSupportedRequest } from "../utils/graphql";
import {
  ensureStateHasAllRequestFields,
  findRequest,
} from "../utils/graphql/request";

export const interceptNewRequest = async (
  request: any,
  _response: any,
  configFilePath: string,
  schemaFilePath: string
) => {
  if (request.body.query) {
    const parsedQuery: any = parse(request.body.query);
    const requestName =
      parsedQuery.definitions[0].selectionSet.selections[0].name.value;
    const requestType = parsedQuery.definitions[0].operation;

    let { requests } = await getConfig(configFilePath);
    const matchingRequestFromConfig = findRequest(requests, request);
    const isNewRequest = !!!matchingRequestFromConfig;

    if (!isNewRequest) {
      await ensureStateHasAllRequestFields(
        request,
        configFilePath,
        schemaFilePath,
        matchingRequestFromConfig,
        requestName,
        requestType
      );
    }

    const requestIsSupported = await isSupportedRequest(
      requestName,
      schemaFilePath
    );
    if (requestIsSupported && isNewRequest) {
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
