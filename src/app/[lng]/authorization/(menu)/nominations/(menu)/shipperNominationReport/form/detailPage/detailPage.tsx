import BtnNomination from '@/components/other/btnNomination'
import ArrowBackIos from '@mui/icons-material/ArrowBackIosOutlined'
import {useEffect, useMemo, useState} from 'react'
import TableEachZone from './tableEachZone'
import dayjs from 'dayjs'
import {findRoleConfigByMenuName, generateUserPermission} from '@/utils/generalFormatter'
import getUserValue from '@/utils/getuserValue'
import {decryptData} from '@/utils/encryptionData'
import getCookieValue from '@/utils/getCookieValue'

const DetailPage: React.FC<any> = ({tableData, modeView, dayOfWeek, setDetailOpen, areaMaster, entryExitMaster, tabIndex, subTabIndex, subTabIndexview}) => {
  const userDT: any = getUserValue()

  const [userPermission, setUserPermission] = useState<any>()
  let user_permission: any = localStorage?.getItem('k3a9r2b6m7t0x5w1s8j')
  user_permission = user_permission ? decryptData(user_permission) : null

  const getPermission = () => {
    try {
      user_permission = user_permission ? JSON.parse(user_permission) : null // Convert JSON string to object

      const permission = findRoleConfigByMenuName(`Shipper Nomination Report`, userDT)
      if (permission) {
        setUserPermission(permission)
      } else if (user_permission?.role_config) {
        const updatedUserPermission = generateUserPermission(user_permission)
        setUserPermission(updatedUserPermission)
      }
    } catch (error) {
      // Failed to parse user_permission:
    }
  }

  useEffect(() => {
    getPermission()
  }, [])

  const [activeButton, setActiveButton] = useState<number | null>(null)

  const handleClick = (id: number | undefined, row_id?: number) => {
    setActiveButton(id || null)
  }

  const buttons = useMemo(() => {
    const baseButtons = [
      {text: 'EAST', id: 1},
      {text: 'WEST', id: 2},
      {text: 'EAST-WEST', id: 3}
    ]

    const matchedButton: any = baseButtons.find((button) => button.text === tableData?.zoneObj.name)

    setActiveButton(matchedButton ? matchedButton?.id : null)

    return matchedButton ? [matchedButton] : [] // Only return the matched button
  }, [tableData])

  return (
    <>
      <div className="space-y-2">
        <div className="text-[#464255] px-4 text-[14px] font-bold pb-4">
          <div
            className="cursor-pointer"
            onClick={() => {
              setDetailOpen(false)
            }}
          >
            <ArrowBackIos style={{fontSize: '14px'}} /> {` Back`}
          </div>
        </div>

        <div className="border-[#DFE4EA] border-[1px] p-4 rounded-xl flex flex-col sm:flex-row gap-2">
          <aside className="flex flex-wrap sm:flex-row gap-2 w-full">
            <div className="mb-4 w-[60%]">
              <div className="grid grid-cols-[120px_150px_120px] text-[#58585A]">
                <p className="!text-[14px] font-semibold">{`Gas Day`}</p>
                <p className="!text-[14px] font-semibold">{`Shipper Name`}</p>
                <p className="!text-[14px] font-semibold">{`Area`}</p>
              </div>

              <div className="grid grid-cols-[120px_150px_120px] !text-[10px] font-light text-[#58585A]">
                <p>{tabIndex == 0 ? tableData?.gas_day_text || tableData?.gas_day : tabIndex === 2 && subTabIndex < 7 ? dayjs(tableData?.gas_day, 'DD/MM/YYYY').add(subTabIndex, 'day').format('DD/MM/YYYY') : dayjs(tableData?.gas_day, 'DD/MM/YYYY').format('DD/MM/YYYY')}</p>
                <p>{tableData?.shipper_name || ''}</p>
                <p>{tableData?.area_text || ''}</p>
              </div>
            </div>
          </aside>

          <aside className="mt-auto ml-1 w-full sm:w-auto">
            <div className="flex flex-nowrap gap-2 justify-end">{/*  */}</div>
          </aside>
        </div>

        <div className="flex h-[calc(100vh-250px)] gap-2 pt-2 overflow-hidden">
          <div className="w-[15%] max-w-[250px] min-w-[200px] p-2 flex flex-col">
            {buttons?.map(({text, id}) => (
              <div key={id} className="pb-2">
                <BtnNomination idToggle={id} btnText={text} disable={false} isActive={activeButton === id} onClick={() => handleClick(id)} />
              </div>
            ))}
          </div>

          <div className="w-[85%] h-full border-[#DFE4EA] border-[1px] gap-2 pt-2 rounded-xl shadow-sm flex flex-col overflow-hidden">
            <div className="flex-1 px-4 overflow-hidden">
              {buttons?.map((button) => {
                if (activeButton === button.id) {
                  switch (button.text) {
                    default:
                      return (
                        <TableEachZone
                          key={button.id}
                          tableData={tableData}
                          areaMaster={areaMaster}
                          entryExitMaster={entryExitMaster}
                          tabMainIndex={tabIndex}
                          subTabIndex={subTabIndex}
                          userPermission={userPermission}
                          subTabIndexview={subTabIndexview}
                          gasDay={tabIndex == 0 ? tableData?.gas_day_text || tableData?.gas_day : tabIndex === 2 && subTabIndex < 7 ? dayjs(tableData?.gas_day, 'DD/MM/YYYY').add(subTabIndex, 'day').format('DD/MM/YYYY') : dayjs(tableData?.gas_day, 'DD/MM/YYYY').format('DD/MM/YYYY')}
                        />
                      )
                  }
                }
                return null // Render nothing if not active
              })}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default DetailPage
