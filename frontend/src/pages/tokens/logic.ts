import { useCallback, useContext, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { PageState } from "../../components/page/types";
import { TokensContext } from "../../reducer/tokens/context";


export const useTokensPageLogic = () => {
    const [tokensState, tokensDispatch] = useContext(TokensContext);
    const [pageState, setPageState] = useState<PageState>(PageState.Initial)
    const navigate = useNavigate();
    const params = useParams()

    const onGoToCreateProjectToken = useCallback(() =>  {
        navigate(`/app/projects/${params.projectId}/tokens/create`)
    }, [params, navigate])

    const onGoToProjectsList = useCallback(() => {
        navigate(`/app/projects`);
    }, [navigate])

    useEffect(() => {
        switch (pageState) {
            case PageState.Initial:
                tokensDispatch({ type: 'get-all-tokens', data: { projectId: params.projectId! } });
                setPageState(PageState.Fetching)
                break
            case PageState.Failed:
                break
            case PageState.Successful:
                break
            default:
                break
        }
    }, [pageState, params, tokensDispatch])

    return {
        tokens: tokensState.getTokens.data,

        onGoToCreateProjectToken,
        onGoToProjectsList
    }
}