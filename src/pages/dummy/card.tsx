import PageContainer from "@components/common/PageContainer"
import { Card } from "@components/Card"
import { useWindowDimensions } from "@utilities/document"
import React, { Dispatch, SetStateAction, useEffect, useState } from "react"
import { ArrowCircleDownIcon, ClipboardCopyIcon, StarIcon } from "@heroicons/react/solid"
import { useAuth } from "@client/auth"
import * as fs from "fs"
import { fetchAClub } from "@client/fetcher/club"
import Router from "next/router"
import { Button } from "@components/common/Inputs/Button"
import { GetStaticProps } from "next"
import classnames from "classnames"
import { endOldClub, startOldClub } from "@config/time"

export const getStaticProps: GetStaticProps = async () => {
  const data = fs.readFileSync("./_map/links.json")
  const links = JSON.parse(data.toString())
  

  return {
    props: {
      links: links,
    },
  }
}

const fetchClubData = async (clubID: string, setClubData: Dispatch<SetStateAction<{}>>) => {
  const data = await fetchAClub(clubID)
  setClubData(data)
}

const Page = ({ links }) => {
  const { width } = useWindowDimensions()
  const { onReady } = useAuth()
  const [clubData, setClubData] = useState({
    place: "",
    contact: {},
    contact2: {},
    contact3: {},
    message: "",
  })
  const [reload, setReload] = useState(false)
  const [auditionList, setAuditionList] = useState(<></>)
  const [userData, setUserData] = useState<any>({})

  const [link, setLink] = useState("")

  const reFetch = () => {
    setReload(true)
  }

  useEffect(() => {

    const d = JSON.parse(localStorage.getItem("dummyData") || "{}")
    const club = localStorage.getItem("dummyClub") || ""

    if (club === ""){
      Router.push("/dummy/select")
    }

    setUserData({...d, club: club, title: "ผู้ใช้ "})

    setReload(false)

  }, [reload])

  useEffect(() => {
    if (userData && userData.club) {
      fetchClubData(userData.club, setClubData)
      setLink(links[userData.club] || "")
    }
  }, [userData])

  let cardWidth,
    padding = 18,
    maxWidth = 480

  if (width < maxWidth) {
    cardWidth = width - 2 * padding
  } else {
    cardWidth = maxWidth - 2 * padding
  }

  const imgUrl = `/api/renderCard?id=${userData.cardID}`

  const download = () => {
    const a = document.createElement("a")
    a.href = imgUrl
    a.download = "Card.png"
    document.body.appendChild(a)
    a.click()
    a.remove()
  }

  return (
    <PageContainer>
      <div>
        {/* <div className="mx-auto mt-10 flex max-w-md flex-col space-y-3 px-7">
          <Button
            disabled={link === ""}
            href={link}
            className={classnames(
              "flex cursor-pointer items-center justify-center space-x-2 rounded-md border bg-white p-5 ",
              link === "" ? "border-TUCMC-gray-500 text-TUCMC-gray-500" : "border-TUCMC-green-500 text-TUCMC-green-500"
            )}
          >
            <ClipboardCopyIcon className={classnames("h-5 w-5", link === "" && "hidden")} />
            <span>{link === "" ? "ไม่พบข้อมูลห้องเรียน" : "เข้าเรียนออนไลน์"}</span>
          </Button>
        </div> */}
        <div className="flex justify-center py-10">
          <Card width={cardWidth} userData={userData} clubData={clubData} />
        </div>
        <div onClick={() =>{Router.push("/dummy/announce")}} className="fixed right-4 bottom-4 bg-TUCMC-pink-400 text-white font-medium text-xl px-10 py-2 rounded-full">
                <h1>กลับสู่ช่วงประกาศผล</h1>
        </div>
        <div className="mx-auto mb-10 flex max-w-md flex-col space-y-3 px-7">
          <div className="flex flex-row space-x-3 rounded-md bg-TUCMC-green-100 p-4 text-TUCMC-gray-700">
            <StarIcon className="h-5 w-5 flex-shrink-0" />
            <div className="text-sm">
              <p>กรุณาดาวน์โหลดรูปภาพหรือถ่ายภาพหน้าจอเก็บไว้เป็นหลักฐาน</p>
            </div>
          </div>
          <div
            onClick={download}
            className="flex cursor-pointer items-center justify-center space-x-2 rounded-md border border-gray-300 bg-white p-5 text-TUCMC-gray-700"
          >
            <ArrowCircleDownIcon className="h-5 w-5" />
            <span>ดาวน์โหลด</span>
          </div>
        </div>
      </div>
    </PageContainer>
  )
}

export default Page