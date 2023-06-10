'use client'

import useUploadModal from "@/hooks/useUploadModal"
import Modal from "./Modal"
import uniqid from 'uniqid'
import { FieldValues, SubmitHandler, useForm } from "react-hook-form"
import { useState } from "react"
import Input from "./Input"
import Button from "./Button"
import { toast } from 'react-hot-toast'
import { useUser } from "@/hooks/useUser"
import { useSupabaseClient } from "@supabase/auth-helpers-react"
import { useRouter } from "next/navigation"
function UploadModal() {
    const uploadModal = useUploadModal()
    const [isLoading, setIsLoading] = useState(false)
    const { user } = useUser()
    const supabaseClient = useSupabaseClient()
    const router = useRouter()
    const {register, handleSubmit, reset} = useForm<FieldValues>({
        defaultValues: {
            author: '',
            title: '',
            song: '',
            image: ''
        }
    })

    const onSubmit: SubmitHandler<FieldValues> = async (values) => {
        try{
            setIsLoading(true)
            const imageFile = values.image?.[0]
            const songFile = values.song?.[0]
            if(!imageFile || !songFile || !user) {
                toast.error('missing fields')
                return
            }
            const uniqueID = uniqid()
            //upload song
            const {data: songData, error: songError} = await supabaseClient.storage.from('songs').upload(`song-${values.title}-${uniqueID}`, songFile, {cacheControl: '3600', upsert: false})
            if(songError){
                setIsLoading(false)
                return toast.error('Failed song upload.')
            }
            // upload image
            const {data: imageData, error: imageError} = await supabaseClient.storage.from('images').upload(`image-${values.title}-${uniqueID}`, imageFile, {cacheControl: '3600', upsert: false})
            if(imageError){
                setIsLoading(false)
                return toast.error('Failed image upload.')
            }

            const { error: supabaseError } = await supabaseClient.from('songs').insert({
                user_id: user.id,
                title: values.title,
                author: values.author,
                image_path: imageData.path,
                song_path: songData.path
            })
            if(supabaseError){
                setIsLoading(false)
                return toast.error(supabaseError.message)
            }
            router.refresh()
            setIsLoading(false)
            reset()
            uploadModal.onClose()
            toast.success('song created!')
        } catch(err){
            toast.error('Something went wrong...')
        } finally {
            setIsLoading(false)
        }
    }
    const onchange = (open: boolean) => {
        if(!open){
            // todo reset the form
            uploadModal.onClose() 
        }
    }
  return (
    <Modal title="upload modal title" description="upload modal description" isOpen={uploadModal.isOpen} onChange={() => {}}>
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-y-4">
            <Input id='title' disabled={isLoading} {...register('title', {required: true})} placeholder='song title' />
            <Input id='author' disabled={isLoading} {...register('author', {required: true})} placeholder='song author' />
            <div>
                <div className="pb-1">
                    Select a song file
                </div>
                <Input id='song' type="file" disabled={isLoading} {...register('song', {required: true})} accept=".mp3" className="text-white" />
            </div>
            <div>
                <div className="pb-1 text-white">
                    Select an image
                </div>
                <Input id='image' type="file" disabled={isLoading} {...register('image', {required: true})} accept="image/*" className="text-white" />
            </div>
            <Button disabled={isLoading} type='submit'>Create</Button>
        </form>
    </Modal>
  )
}

export default UploadModal