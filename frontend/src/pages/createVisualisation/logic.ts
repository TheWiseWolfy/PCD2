import { useContext, useEffect, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { VisualisationsContext } from "../../reducer/visualisations/context"
import { PageState } from "../../components/page/types"
import { NotificationsContext } from "../../reducer/notifications/context"

export const useCreateVisualisationPageLogic = () => {
    const [, notificationsDispatch] = useContext(NotificationsContext);
    const [visualisationsState, visualisationsDispatch] = useContext(VisualisationsContext)
    const [pageState, setPageState] = useState<PageState>(PageState.Initial)
    const [disabled, setDisabled] = useState(false);
    const [name, setName] = useState('')
    const [nameValid, setNameValid] = useState(true)
    const [fn, setFn] = useState('')
    const [fnValid, setFnValid] = useState(true)
    const [description, setDescription] = useState('')
    const [descriptionValid, setDescriptionValid] = useState(true)
    const navigate = useNavigate()
    const params = useParams()
    
    const onSubmit = () => {
        visualisationsDispatch({ type: 'create-visualisation', data: { name, description, fn } });
        setPageState(PageState.Fetching)
    };

    const onGoToVisualisationsList = () => {
        navigate(`/app/projects/${params.projectId}/visualisations`)
    }
    
    useEffect(() => {
        setNameValid(name.length > 0 && name.length < 65);
        setDescriptionValid(description.length < 257);
        setFnValid(true); // TODO: update
    }, [name, description, fn]);

    useEffect(() => {
        switch (pageState) {
            case PageState.Loading:
            case PageState.Fetching:
                setDisabled(true)
                break
            case PageState.Failed:
                setDisabled(false)
                notificationsDispatch({
                    type: 'notifications-add',
                    data: {
                        type: 'negative',
                        title: 'Visualisation creation error',
                        description: visualisationsState.createVisualisation.error || ''
                    }
                })
                break
            case PageState.Successful:
                setDisabled(false)
                notificationsDispatch({
                    type: 'notifications-add',
                    data: {
                        type: 'positive',
                        title: 'Visualisation creation succeeded',
                        description: 'Redirecting...'
                    }
                })
                navigate('/app/visualisations');
                break
            default:
                setDisabled(false)
                break
        }
    }, [pageState])

    useEffect(() => {
        if (pageState !== PageState.Initial) {
            if (!visualisationsState.createVisualisation.fetching && visualisationsState.createVisualisation.error) {
                setPageState(PageState.Failed);
            } else if (!visualisationsState.createVisualisation.fetching && !visualisationsState.createVisualisation.error && visualisationsState.createVisualisation.data) {
                setPageState(PageState.Successful);
            }
        }
    }, [pageState, visualisationsState.createVisualisation]);

    return {
        name,
        setName,
        description,
        setDescription,
        fn,
        setFn,
        
        fetching: pageState === PageState.Fetching,
        disabled,

        nameValid,
        descriptionValid,
        fnValid,

        onSubmit,
        onGoToVisualisationsList,
    }
}