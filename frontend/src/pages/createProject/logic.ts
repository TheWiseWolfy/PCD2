import { useContext, useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { ProjectsContext } from "../../reducer/projects/context"
import { PageState } from "../../components/page/types"

export const useCreateProjectPageLogic = () => {
    const [projectsState, projectsDispatch] = useContext(ProjectsContext)
    const [pageState, setPageState] = useState<PageState>(PageState.Initial)
    const [disabled, setDisabled] = useState(false);
    const [name, setName] = useState('')
    const [nameValid, setNameValid] = useState(true)
    const [description, setDescription] = useState('')
    const [descriptionValid, setDescriptionValid] = useState(true)
    const navigate = useNavigate()
    
    const onSubmit = () => {
        projectsDispatch({ type: 'create-project', data: { name, description } });
        setPageState(PageState.Fetching)
    };

    const onGoToProjectsList = () => {
        navigate(`/app/projects`)
    }
    
    useEffect(() => {
        setNameValid(name.length > 0 && name.length < 65);
        setDescriptionValid(description.length < 257);
    }, [name, description]);

    useEffect(() => {
        switch (pageState) {
            case PageState.Loading:
            case PageState.Fetching:
                setDisabled(true)
                break
            case PageState.Failed:
                setDisabled(false)
                break
            case PageState.Successful:
                setDisabled(false)
                break
            default:
                setDisabled(false)
                break
        }
    }, [pageState])

    return {
        name,
        setName,
        description,
        setDescription,
        
        fetching: pageState === PageState.Fetching,
        disabled,

        nameValid,
        descriptionValid,

        onSubmit,
        onGoToProjectsList,
    }
}