import { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ProjectsContext } from "../../reducer/projects/context";
import { useAuthenticated } from "../../hooks/useAuthenticated";
import { PageState } from "../../common/page/types";


export const useProjectsPageLogic = () => {
    const [projectsState, projectsDispatch] = useContext(ProjectsContext);
    const [pageState, setPageState] = useState<PageState>(PageState.Initial)
    const navigate = useNavigate();

    const onGoToCreateProject = () =>  {
        navigate('/app/projects/create')
    }

    const onGoToProject = (projectId: string) => () => {
        navigate(`/app/projects/${projectId}/statistics`);
    };

    useAuthenticated();

    useEffect(() => {
        switch (pageState) {
            case PageState.Initial:
                projectsDispatch({ type: 'get-all-projects' });
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
        projects: projectsState.getProjects.data,

        onGoToCreateProject,
        onGoToProject
    }
}