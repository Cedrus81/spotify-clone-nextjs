'use client'

import SongItem from "@/components/SongItem"
import { Song } from "@/types"

interface PageContentProps {
  songs: Song[]
}
function PageContent({songs}: PageContentProps) {
  if(songs.length === 0){
    return (
      <div className="mt-4 text-neutral-400">
        No songs available
      </div>
    )
  }
  return (
    <div className="grid grid-cols 
                    sm:grid-cols-2
                    md:grid-cols-3
                    lg:grid-cols-4
                    xl:grid-cols-5
                    2xl:grid-cols-8
                    gap-4
                    mt-4">
                      {songs.map(s => (<SongItem key={s.id} onClick={()=>{}} data={s} />))}
                    </div>
  )
}

export default PageContent