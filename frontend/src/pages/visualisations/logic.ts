import { useCallback, useContext, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { PageState } from "../../components/page/types";
import { VisualisationsContext } from "../../reducer/visualisations/context";


export const useVisualisationsPageLogic = () => {
    const [visualisationsState, visualisationsDispatch] = useContext(VisualisationsContext);
    const [pageState, setPageState] = useState<PageState>(PageState.Initial)
    const navigate = useNavigate();
    const params = useParams()

    const onGoToCreateVisualisation = useCallback(() => {
        navigate(`/app/projects/${params.projectId}/visualisations/create`);
    }, [params, navigate])

    const onGoToProjectsList = useCallback(() => {
        navigate('/app/projects')
    }, [navigate])

    useEffect(() => {
        switch (pageState) {
            case PageState.Initial:
                visualisationsDispatch({ type: 'get-all-visualisations', data: { projectId: params.projectId! } });
                setPageState(PageState.Fetching)
                break
            case PageState.Failed:
                break
            case PageState.Successful:
                break
            default:
                break
        }
    }, [pageState, params, visualisationsDispatch])

    return {
        visualisations: visualisationsState.getAllVisualisations.data,

        onGoToCreateVisualisation,
        onGoToProjectsList
    }
}