import { useCallback, useContext, useEffect, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { PageState } from "../../components/page/types"
import { NotificationsContext } from "../../reducer/notifications/context"
import { VisualisationsContext } from "../../reducer/visualisations/context"

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
    
    const onSubmit = useCallback(() => {
        visualisationsDispatch({ type: 'create-visualisation', data: { name, description, fn } });
        setPageState(PageState.Fetching)
    }, [name, description, fn, visualisationsDispatch])

    const onGoToVisualisationsList = useCallback(() => {
        navigate(`/app/projects/${params.projectId}/visualisations`)
    }, [params, navigate])
    
    useEffect(() => {
        setNameValid(name.length > 0 && name.length < 65);
        setDescriptionValid(description.length < 257);
        setFnValid(true); // TODO: update
    }, [name, description, fn]);

    useEffect(() => {
        if (nameValid && descriptionValid && fnValid) {
            setDisabled(false)
        } else {
            setDisabled(true)
        }
    }, [nameValid, descriptionValid, fnValid])


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
                onGoToVisualisationsList()
                break
            default:
                setDisabled(false)
                break
        }
    }, [pageState, visualisationsState.createVisualisation.error, notificationsDispatch, onGoToVisualisationsList])

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