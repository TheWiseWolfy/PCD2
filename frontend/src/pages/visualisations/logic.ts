import { useContext, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { VisualisationsContext } from "../../reducer/visualisations/context";
import { PageState } from "../../components/page/types";


export const useVisualisationsPageLogic = () => {
    const [visualisationsState, visualisationsDispatch] = useContext(VisualisationsContext);
    const [pageState, setPageState] = useState<PageState>(PageState.Initial)
    const navigate = useNavigate();
    const params = useParams()

    const onGoToCreateVisualisation = () => {
        navigate(`/app/projects/${params.projectId}/visualisations/create`);
    };

    const onGoToProjects = () =>  {
        navigate('/app/projects')
    }

    useEffect(() => {
        switch (pageState) {
            case PageState.Initial:
                visualisationsDispatch({ type: 'get-all-visualisations' });
                setPageState(PageState.Fetching)
                break
            case PageState.Failed:
                break
            case PageState.Successful:
                break
            default:
                break
        }
    }, [pageState])

    return {
        visualisations: visualisationsState.getAllVisualisations.data,

        onGoToCreateVisualisation,
        onGoToProjects
    }
}