import * as pdfMake from "pdfmake/build/pdfmake";
import {
  vfs,
  logoPtt,
  used,
  notUsed,
  checkBoxCheck,
  checkBox,
} from "./fonts/vfs_fonts";
import React, { useEffect, useMemo, useState } from "react";

// import * as dayjs from 'dayjs'
import dayjs from "dayjs";

import customParseFormat from "dayjs/plugin/customParseFormat";
import isSameOrAfter from "dayjs/plugin/isSameOrAfter";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import buddhistEra from "dayjs/plugin/buddhistEra";

import isBetween from "dayjs/plugin/isBetween";
import { postService } from "@/utils/postService";

dayjs.extend(isBetween);
dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(customParseFormat);
dayjs.extend(isSameOrAfter);
dayjs.extend(buddhistEra);

const PDFMiddleCustom = ({ docDefinition }: any) => {
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);

  useEffect(() => {
    let url: string | null = null;

    const pdfDocGenerator = (pdfMake as any).createPdf(docDefinition);
    pdfDocGenerator.getBlob((blob: Blob) => {
      url = URL.createObjectURL(blob);
      setPdfUrl(url);
    });

    return () => {
      if (url) URL.revokeObjectURL(url);
    };
  }, [docDefinition]);

  return (
    <>
      <div className="w-full mb-5">
        {!pdfUrl ? (
          <div>กำลังสร้าง PDF...</div>
        ) : (
          <iframe
            src={`${pdfUrl}#zoom=page-width&navpanes=0&toolbar=1`}
            className="w-full h-[550px] border"
            title="pdf-preview"
          />
        )}
      </div>
    </>
  );
};

const UiRedderPDF = ({ pdfUrlArr }:any ) => {
  const [tab_, settab_] = useState(0)

   return (
    <>
    {
      <div className="flex">
        {
          (pdfUrlArr || [])?.map((e:any, ix:number) => {
          return (
              <div onClick={()=> settab_(ix)} key={ix} className={`${ix === tab_ ? " bg-gray-200" : ""} ${ix === 0 ? " rounded-tl-md" : ""} ${ix === (pdfUrlArr?.length - 1) ? " rounded-tr-md" : ""} border px-3 py-1`}>{e?.shipperName}</div>
            )
          })
      }
        </div>
    }
      
      {
        <div>
          {(pdfUrlArr || [])?.[tab_]?.pdfUrl}
        </div>
      }
      
    </>
  );
}

// DOC.1 done
export function PdfDoc1({ data }: any) {
  const docDefinition = useMemo(() => {
    // signature

    const logoImage = `data:image/png;base64,${logoPtt}`;
    const logoUsed = `data:image/png;base64,${used}`;
    const logoNotUsed = `data:image/png;base64,${notUsed}`;
    // const rdoc1Find = await this.doc1Find(id, userId)
    const rdoc1Find: any = null;

    // ##########################
    const document_code = `……………`;
    const fromFullname = `……………………………………………………`;
    
    const userType_ = data?.dataOpenDocument?.group?.user_type_id // (userType_ === 3 ? ' Shipper' : "")
    const fromCompany = `${data?.dataOpenDocument?.group?.name || `……………`}${(userType_ === 3 ? ' Shipper' : "")}`;
    const fromDate = dayjs().locale("th");
    const fromSignature = ""; //
    const toFullname = `……………………………………………………`;
    const toCompany = "PTT TSO";
    // const toSignature = data?.userDT?.signature ? toDataUrl(data?.userDT?.signature) : '' //
    const toSignature = ""; //
    const toDate = dayjs().locale("th");
    const event_nember = data?.dataOpenDocument?.event_nember || `……`;
    // const event_doc_status = 3 // 3 accept, 4 reject, 5 Acknowledge
    const event_doc_status = data?.data?.[0]?.item?.event_doc_status_id || null; // 3 accept, 4 reject, 5 Acknowledge
    // const event_doc_status = (Math.random()>=0.5)? 3 : 4 // 3 accept, 4 reject, 5 Acknowledge
    const event_runnumber = dayjs().locale("th");
    const input_delivery_point_at_the_scene =
      data?.data?.[0]?.item?.input_delivery_point_at_the_scene || `……………`;
    const input_date_time_of_the_incident =
      data?.data?.[0]?.item?.input_date_time_of_the_incident || `……………`;
    const input_gas_quality_is_not_in_the_gas_quality_requirements =
      data?.data?.[0]?.item
        ?.input_gas_quality_is_not_in_the_gas_quality_requirements || `……………`;
    const input_more = data?.data?.[0]?.item?.input_more || `……………`;
    const input_reason_the_gas_quality_requirements =
      data?.data?.[0]?.item?.input_reason_the_gas_quality_requirements ||
      `……………`;
    const input_duration_that_is_expected_to_be_completed =
      data?.data?.[0]?.item?.input_duration_that_is_expected_to_be_completed ||
      `……………`;
    const input_note = data?.data?.[0]?.item?.input_note || `……………`;

    const longdo_dict = data?.data?.[0]?.item?.longdo_dict || `……………`; //สำเนา
    const nameGroupDoc = `……`;
    // ##########################
    // จุดส่งเข้าที่เกิดเหตุ | input_delivery_point_at_the_scene
    // วัน/เวลาที่เกิดเหตุ | input_date_time_of_the_incident
    // ประเภทและค่าของคุณภาพก๊าซไม่อยู่ในข้อกำหนดคุณภาพก๊าซ | input_gas_quality_is_not_in_the_gas_quality_requirements
    // เพิ่มเติม | input_more
    // สาเหตุที่ทำให้ก๊าซไม่อยู่ในข้อกำหนดคุณภาพก๊าซ | input_reason_the_gas_quality_requirements
    // ระยะเวลาที่คาดว่าจะแก้ไขแล้วเสร็จ | input_duration_that_is_expected_to_be_completed
    // หมายเหตุ | input_note

    (pdfMake as any).vfs = vfs;
    const fonts = {
      THSarabun: {
        normal: "THSarabunNew.ttf",
        bold: "THSarabunNew-Bold.ttf",
        italics: "THSarabunNew.ttf",
        bolditalics: "THSarabunNew-Bold.ttf",
      },
    };
    (pdfMake as any).fonts = fonts;
    const docDefinition = {
      header: (currentPage: any, pageCount: any) => {
        return {
          columns: [
            {
              width: "*",
              text: "",
            }, // เว้นซ้าย
            {
              width: "auto",
              stack: [
                {
                  text: `เลขที่เอกสาร: …………${event_nember}/${document_code || ""}-${nameGroupDoc}…………`,
                  fontSize: 12,
                  alignment: "right",
                },
                {
                  text: `วันเดือนปีเอกสาร: ……${event_runnumber.format("DD")}…/……${event_runnumber.format("MMM")}…/…${event_runnumber.format("BBBB")}…………`,
                  fontSize: 12,
                  alignment: "right",
                },
              ],
              margin: [0, 5, 10, 0], // [left, top, right, bottom],
            },
          ],
        };
      },
      content: [
        {
          image: logoImage,
          width: 70,
          alignment: "center",
          margin: [0, 0, 0, 10],
        },

        {
          text: "เอกสารแจ้งเตือนคุณภาพก๊าซฯ 1",
          alignment: "center",
          fontSize: 18,
          bold: true,
          margin: [0, 0, 0, 5],
        },
        {
          text: "เอกสารแจ้งเหตุคุณภาพก๊าซที่นำเข้าไม่อยู่ในข้อกำหนดคุณภาพก๊าซ หรือ กรณีคุณภาพหรือปริมาณก๊าซนำเข้าก๊าซเบี่ยงเบนมากกว่ากำหนดที่กำหนด",
          alignment: "center",
          margin: [0, 0, 0, 10],
        },

        {
          table: {
            widths: ["auto", "*"],
            body: [
              [
                {
                  text: "เรียน:",
                  bold: true,
                  alignment: "center",
                  verticalAlignment: "middle",
                  margin: [0, 10, 0, 10],
                },
                {
                  text: "ส่วนบริหารและควบคุมระบบส่งก๊าซ (Gas Transmission Management & System Operation Division)",
                  verticalAlignment: "middle",
                  margin: [0, 10, 0, 10],
                },
              ],
              [
                {
                  text: "สำเนา:",
                  bold: true,
                  alignment: "center",
                  verticalAlignment: "middle",
                  margin: [0, 10, 0, 10],
                },
                {
                  stack: [`${longdo_dict}`, "โทร 025372000,35063"],
                },
              ],
            ],
          },
          layout: {
            hLineWidth: () => 0.5,
            vLineWidth: () => 0.5,
          },
          margin: [0, 0, 0, 0],
        },

        // ======== กรอบ "ส่วนของผู้ใช้บริการ" =========
        {
          table: {
            widths: ["*"],
            body: [
              [
                {
                  stack: [
                    {
                      text: "ส่วนของผู้ใช้บริการ (ผู้ทำให้เกิดเหตุการณ์)",
                      bold: true,
                      decoration: "underline",
                      margin: [0, 0, 0, 5],
                    },
                    {
                      ul: [
                        {
                          text: [
                            "จุดที่ส่งเข้าที่เกิดเหตุ : ",
                            {
                              text: input_delivery_point_at_the_scene
                                ? input_delivery_point_at_the_scene
                                : "____________",
                              decoration:
                                input_delivery_point_at_the_scene &&
                                "underline",
                            },
                          ],
                        },
                        {
                          text: [
                            "วัน/เวลาที่เกิดเหตุ : ",
                            {
                              text: input_date_time_of_the_incident
                                ? input_date_time_of_the_incident
                                : "____________",
                              decoration:
                                input_date_time_of_the_incident && "underline",
                            },
                          ],
                        },
                        {
                          text: [
                            "ประเภทและค่าที่ไม่อยู่ในข้อกำหนด/เกณฑ์ที่กำหนด  : ",
                            {
                              text: input_gas_quality_is_not_in_the_gas_quality_requirements
                                ? input_gas_quality_is_not_in_the_gas_quality_requirements
                                : "____________",
                              decoration:
                                input_gas_quality_is_not_in_the_gas_quality_requirements &&
                                "underline",
                            },
                          ],
                        },
                        {
                          text: [
                            {
                              text: input_more ? input_more : "____________",
                              decoration: input_more && "underline",
                            },
                          ],
                        },
                        {
                          text: [
                            "สาเหตุที่ทำให้ก๊าซไม่อยู่ในข้อกำหนด/เกณฑ์ที่กำหนด : ",
                            {
                              text: input_reason_the_gas_quality_requirements
                                ? input_reason_the_gas_quality_requirements
                                : "____________",
                              decoration:
                                input_reason_the_gas_quality_requirements &&
                                "underline",
                            },
                          ],
                        },
                        {
                          text: [
                            "ระยะเวลาที่คาดว่าจะแก้ไขแล้วเสร็จ : ",
                            {
                              text: input_duration_that_is_expected_to_be_completed
                                ? input_duration_that_is_expected_to_be_completed
                                : "____________",
                              decoration:
                                input_duration_that_is_expected_to_be_completed &&
                                "underline",
                            },
                          ],
                        },
                      ],
                    },
                  ],
                  margin: [5, 5, 5, 5],
                },
              ],
            ],
          },
          layout: {
            hLineWidth: () => 0.5,
            vLineWidth: () => 0.5,
          },
          margin: [0, 0, 0, 0],
        },

        // ======== กรอบ "รับ/ปฏิเสธ" =========
        {
          table: {
            widths: ["*"],
            body: [
              [
                {
                  stack: [
                    {
                      text: "ส่วนของผู้ใช้บริการ",
                      bold: true,
                      decoration: "underline",
                      margin: [0, 0, 0, 5],
                    },
                    {
                      columns: [
                        {
                          width: 15,
                          image:
                            event_doc_status === 3 ? logoUsed : logoNotUsed, // แทนด้วย base64 string //event_doc_status
                          verticalAlignment: "middle",
                          alignment: "center",
                          fit: [12, 12],
                        },
                        {
                          text: [
                            {
                              text: "รับ ",
                              bold: true,
                            },
                            "ก๊าซไม่อยู่ในข้อตกลงฯ/เกณฑ์ที่กำหนด",
                          ],
                          margin: [5, 0, 0, 0], // เว้นระยะจากรูป
                          alignment: "left",
                        },
                      ],
                      margin: [0, 0, 0, 2],
                    },
                    {
                      columns: [
                        {
                          width: 15,
                          image:
                            event_doc_status === 4 ? logoUsed : logoNotUsed, // แทนด้วย base64 string
                          verticalAlignment: "middle",
                          alignment: "center",
                          fit: [12, 12],
                        },
                        {
                          text: [
                            {
                              text: "ปฏิเสธ ",
                              bold: true,
                            },
                            "ก๊าซไม่อยู่ในข้อตกลงฯ/เกณฑ์ที่กำหนด",
                          ],
                          margin: [5, 0, 0, 0], // เว้นระยะจากรูป
                          alignment: "left",
                        },
                      ],
                      margin: [0, 0, 0, 2],
                    },
                    {
                      text: [
                        "หมายเหตุ : ",
                        {
                          text: input_note ? input_note : "____________",
                          decoration: input_note && "underline",
                        },
                      ],
                      margin: [0, 5, 0, 2],
                    },
                  ],
                  margin: [5, 5, 5, 5],
                },
              ],
            ],
          },
          layout: {
            hLineWidth: () => 0.5,
            vLineWidth: () => 0.5,
          },
          margin: [0, 0, 0, 0],
        },

        // ======== กรอบช่องเซ็นชื่อ =========
        {
          table: {
            widths: ["*", "*"],
            body: [
              [
                {
                  stack: [
                    fromSignature
                      ? {
                          columns: [
                            {
                              text: "แจ้งโดย",
                              width: "auto",
                              alignment: "right",
                            },
                            {
                              image: fromSignature, // base64 หรือ path
                              // width: 40,
                              fit: [40, 40],
                              margin: [0, 0, 0, 0],
                              alignment: "left",
                            },
                          ],
                          columnGap: 15, // ระยะห่างระหว่างวงเล็บกับภาพ
                          margin: [0, 2, 0, 5], // ปรับระยะรอบภาพ
                        }
                      : {
                          text: `แจ้งโดย `,
                        },
                    {
                      text: fromFullname
                        ? `( ${fromFullname} )`
                        : `(                                   )`,
                    },

                    {
                      text: `หน่วยงาน ${fromCompany} (ผู้ใช้บริการ)`,
                    },
                    {
                      text: `เวลา : ${fromDate.format("HH:mm")} น. วันที่/เดือน/ปี: ${fromDate.format("DD")} / ${fromDate.format("MM")} / ${fromDate.format("BB")}`,
                    },
                  ],
                  margin: [5, 5, 5, 5],
                },
                {
                  stack: [
                    toSignature
                      ? {
                          columns: [
                            {
                              text: "รับทราบโดย",
                              width: "auto",
                              alignment: "right",
                            },
                            {
                              image: toSignature, // base64 หรือ path
                              fit: [40, 40],
                              margin: [0, 0, 0, 0],
                              alignment: "left",
                            },
                          ],
                          columnGap: 15, // ระยะห่างระหว่างวงเล็บกับภาพ
                          margin: [0, 2, 0, 5], // ปรับระยะรอบภาพ
                        }
                      : {
                          text: `รับทราบโดย`,
                        },
                    {
                      text: toFullname
                        ? `( ${toFullname} )`
                        : `(                                   )`,
                    },
                    {
                      text: `หน่วยงาน ${rdoc1Find?.event_doc_status?.id === 2 ? " " : toCompany} (ผู้ให้บริการ)`,
                    },
                    {
                      text: `เวลา : ${rdoc1Find?.event_doc_status?.id === 2 ? " " : toDate.format("HH:mm")} น. วันที่/เดือน/ปี: ${rdoc1Find?.event_doc_status?.id === 2 ? " " : toDate.format("DD")} / ${rdoc1Find?.event_doc_status?.id === 2 ? " " : toDate.format("MM")} / ${rdoc1Find?.event_doc_status?.id === 2 ? " " : toDate.format("BB")}`,
                    },
                  ],
                  margin: [5, 5, 5, 5],
                },
              ],
            ],
          },
          layout: {
            hLineWidth: () => 0.5,
            vLineWidth: () => 0.5,
          },
          margin: [0, 0, 0, 0],
        },
      ],
      defaultStyle: {
        font: "THSarabun",
        fontSize: 14,
      },
    };

    return docDefinition;
  }, [data]);

    return <UiRedderPDF pdfUrlArr={[
    {
      ix: 0,
      shipperId: data?.dataOpenDocument?.group?.id || null,
      shipperName: data?.dataOpenDocument?.group?.name || null,
      pdfUrl: <PDFMiddleCustom docDefinition={docDefinition} />
    },
  ]} />;
}

// DOC.2 done
export function PdfDoc2({ data }: any) {

  const shipperIdArr = data?.data?.[0]?.item?.shipper || []

  return <UiRedderPDF pdfUrlArr={shipperIdArr.map((e:any, ix:number) => {
    return   {
      ix: ix,
      shipperId: (data?.shipperData || [])?.find((f:any) => f?.id === e)?.id || null,
      shipperName: (data?.shipperData || [])?.find((f:any) => f?.id === e)?.name || null,
      pdfUrl: <PDFMiddleCustom docDefinition={PdfDoc2Used({shipper: (data?.shipperData || [])?.find((f:any) => f?.id === e) || null, data})} />
    }
  })} />;
 
}

const PdfDoc2Used = ({ shipper, data }: any) => {
    const group: any = null;
    const groupId: any = null;
    const logoImage = `data:image/png;base64,${logoPtt}`;
    const logoUsed = `data:image/png;base64,${used}`;
    const logoNotUsed = `data:image/png;base64,${notUsed}`;

    const findRunnumber: any = null;

    const rdoc1Find: any = {
      ...data?.data?.[0]?.item
    };

    const shipperNameArr = shipper?.name || "";
   
    const document_code_doc2 = `${data?.dataOpenDocument?.event_runnumber?.event_nember || "……"}/${data?.dataOpenDocument?.document_code || "……"}-${shipperNameArr || "……"}`;

    const event_document_action = rdoc1Find?.event_document_action;

    const toAction = event_document_action?.find(
      (f: any) =>
        (f?.user_type_id === 3 || f?.user_type_id === 4) &&
        f?.group_id === groupId,
    );
    const toFullname = "……………………………………………………";
    const userType_ = toAction?.group?.user_type_id // (userType_ === 3 ? ' Shipper' : "")
    const toCompany = (shipperNameArr || "………………") + (userType_ === 3 ? ' Shipper' : "");
    const toDate = dayjs().locale("th");
    const toSignature = ""; //

    // ----
    const fromFullname = "……………………………………………………";
    // const fromCompany = 'บริษัท ปตท.จำกัด (มหาชน)'
    const fromCompany = "PTT TSO";
    const fromSignature = ""; //

    const fromDate = dayjs(rdoc1Find?.create_date).locale("th");

    const event_nember = rdoc1Find?.event_runnumber?.event_nember;
    const event_doc_status = rdoc1Find?.event_doc_status?.id; // 3 accept, 4 reject, 5 Acknowledge
    const event_runnumber = dayjs(rdoc1Find?.event_date).locale("th");

    const input_delivery_point_at_the_scene =
      rdoc1Find?.doc2_input_delivery_point_at_the_scene;
    const input_date_time_of_the_incident =
      rdoc1Find?.doc2_input_date_time_of_the_incident;
    const input_gas_quality_is_not_in_the_gas_quality_requirements =
      rdoc1Find?.doc2_input_gas_quality_is_not_in_the_gas_quality_requirements;
    const input_reason_the_gas_quality_requirements =
      rdoc1Find?.doc2_input_reason_the_gas_quality_requirements;
    const input_duration_that_is_expected_to_be_completed =
      rdoc1Find?.doc2_input_duration_that_is_expected_to_be_completed;
    const input_duration_of_the_gas_travel_to_various_points =
      rdoc1Find?.doc2_input_duration_of_the_gas_travel_to_various_points;
    const input_note = rdoc1Find?.doc2_input_note;

    const longdo_dict = rdoc1Find?.longdo_dict || ""; //สำเนา

    (pdfMake as any).vfs = vfs;
    const fonts = {
      THSarabun: {
        normal: "THSarabunNew.ttf",
        bold: "THSarabunNew-Bold.ttf",
        italics: "THSarabunNew.ttf",
        bolditalics: "THSarabunNew-Bold.ttf",
      },
    };
    (pdfMake as any).fonts = fonts;
    const docDefinition = {
      header: (currentPage: any, pageCount: any) => {
        return {
          columns: [
            {
              width: "*",
              text: "",
            }, // เว้นซ้าย
            {
              width: "auto",
              stack: [
                {
                  // text: `เลขที่เอกสาร: …………${event_nember}…………`,
                  text: `เลขที่เอกสาร: …………${document_code_doc2}…………`,
                  fontSize: 12,
                  alignment: "right",
                },
                {
                  text: `วันเดือนปีเอกสาร: ……${event_runnumber.format("DD")}…/……${event_runnumber.format("MMM")}……${event_runnumber.format("BBBB")}…………`,
                  fontSize: 12,
                  alignment: "right",
                },
              ],
              margin: [0, 5, 10, 0], // [left, top, right, bottom],
            },
          ],
        };
      },
      content: [
        {
          image: logoImage,
          width: 70,
          alignment: "center",
          margin: [0, 0, 0, 10],
        },

        {
          text: "เอกสารแจ้งเตือนคุณภาพก๊าซฯ 2",
          alignment: "center",
          fontSize: 18,
          bold: true,
          margin: [0, 0, 0, 5],
        },
        {
          text: "เอกสารแจ้งคุณภาพก๊าซผสม ไม่อยู่ในข้อกำหนดคุณภาพก๊าซ",
          alignment: "center",
          margin: [0, 0, 0, 10],
        },

        // ======== กรอบ "เรียน / สำเนา" =========
        {
          table: {
            widths: ["auto", "*"],
            body: [
              [
                {
                  text: "เรียน:",
                  bold: true,
                  alignment: "center",
                  verticalAlignment: "middle",
                  margin: [0, 10, 0, 10],
                },
                {
                  stack: [
                    `${shipperNameArr}`,
                    // `${group?.company_name ? group?.name : group?.name}`  // doc2: PDF ช่องเรียน ควรที่จะเป็น full name ของ shipper
                    // 'โรงไฟฟ้าพลังความร้อนร่วมบางปะกงชุดที่ 1 (BPK-C1)',
                  ],
                  margin: [0, 10, 0, 10], // << บังคับความสูงให้จัดกลาง
                },
              ],
              [
                {
                  text: "สำเนา:",
                  bold: true,
                  alignment: "center",
                  verticalAlignment: "middle",
                  margin: [0, 10, 0, 10],
                },
                {
                  stack: [`${longdo_dict || ""}`],
                  margin: [0, 10, 0, 10], // << บังคับความสูงให้จัดกลาง
                },
              ],
            ],
          },
          layout: {
            hLineWidth: () => 0.5,
            vLineWidth: () => 0.5,
          },
          margin: [0, 0, 0, 0],
        },

        // ======== กรอบ "ส่วนของผู้ใช้บริการ" =========
        {
          table: {
            widths: ["*"],
            body: [
              [
                {
                  stack: [
                    {
                      text: "ส่วนของผู้ใช้บริการ (ผู้ทำให้เกิดเหตุการณ์)",
                      bold: true,
                      decoration: "underline",
                      margin: [0, 0, 0, 5],
                    },
                    {
                      ul: [
                        {
                          text: [
                            "จุดส่งเข้าที่ก๊าซไม่อยู่ในข้อกำหนดคุณภาพก๊าซ : ",
                            {
                              text: input_delivery_point_at_the_scene
                                ? input_delivery_point_at_the_scene
                                : "_______________",
                              decoration:
                                input_delivery_point_at_the_scene &&
                                "underline",
                            },
                          ],
                        },
                        {
                          text: [
                            "เวลาที่ก๊าซไม่อยู่ในข้อกำหนดคุณภาพก๊าซ : ",
                            {
                              text: input_date_time_of_the_incident
                                ? input_date_time_of_the_incident
                                : "_______________",
                              decoration:
                                input_date_time_of_the_incident && "underline",
                            },
                          ],
                        },
                        {
                          text: [
                            "ประเภทและค่าของคุณภาพก๊าซไม่อยู่ในข้อกำหนดคุณภาพก๊าซ : ",
                            {
                              text: input_gas_quality_is_not_in_the_gas_quality_requirements
                                ? input_gas_quality_is_not_in_the_gas_quality_requirements
                                : "_______________",
                              decoration:
                                input_gas_quality_is_not_in_the_gas_quality_requirements &&
                                "underline",
                            },
                          ],
                        },
                        {
                          text: [
                            "สาเหตุที่ทำให้ก๊าซไม่อยู่ในข้อกำหนดคุณภาพก๊าซ : ",
                            {
                              text: input_reason_the_gas_quality_requirements
                                ? input_reason_the_gas_quality_requirements
                                : "_______________",
                              decoration:
                                input_reason_the_gas_quality_requirements &&
                                "underline",
                            },
                          ],
                        },
                        {
                          text: [
                            "ระยะเวลาที่คาดว่าจะแก้ไขแล้วเสร็จ : ",
                            {
                              text: input_duration_that_is_expected_to_be_completed
                                ? input_duration_that_is_expected_to_be_completed
                                : "_______________",
                              decoration:
                                input_duration_that_is_expected_to_be_completed &&
                                "underline",
                            },
                          ],
                        },
                        {
                          text: [
                            "ระยะเวลาที่ก๊าซฯ เดินทางถึงจุดต่าง ๆ : ",
                            {
                              text: input_duration_of_the_gas_travel_to_various_points
                                ? input_duration_of_the_gas_travel_to_various_points
                                : "_______________",
                              decoration:
                                input_duration_of_the_gas_travel_to_various_points &&
                                "underline",
                            },
                          ],
                        },
                        // `จุดส่งเข้าที่ก๊าซไม่อยู่ในข้อกำหนดคุณภาพก๊าซ: ${input_delivery_point_at_the_scene || '-'}`,
                        // `วัน/เวลาที่ก๊าซไม่อยู่ในข้อกำหนดคุณภาพก๊าซ: ${input_date_time_of_the_incident || '-'}`,
                        // `ประเภทและค่าของคุณภาพก๊าซไม่อยู่ในข้อกำหนดคุณภาพก๊าซ: ${input_gas_quality_is_not_in_the_gas_quality_requirements || '-'}`,
                        // `สาเหตุที่ทำให้ก๊าซไม่อยู่ในข้อกำหนดคุณภาพก๊าซ: ${input_reason_the_gas_quality_requirements || '-'}`,
                        // `ระยะเวลาที่คาดว่าจะแก้ไขแล้วเสร็จ : ${input_duration_that_is_expected_to_be_completed || '-'}`,
                        // `ระยะเวลาที่ก๊าซฯ เดินทางถึงจุดต่าง ๆ : ${input_duration_of_the_gas_travel_to_various_points || '-'}`,
                      ],
                    },
                  ],
                  margin: [5, 5, 5, 5],
                },
              ],
            ],
          },
          layout: {
            hLineWidth: () => 0.5,
            vLineWidth: () => 0.5,
          },
          margin: [0, 0, 0, 0],
        },

        // ======== กรอบ "ส่วน" =========
        {
          table: {
            widths: ["*"],
            body: [
              [
                {
                  stack: [
                    {
                      text: "ส่วนของผู้ใช้บริการ",
                      bold: true,
                      decoration: "underline",
                      margin: [0, 0, 0, 5],
                    },
                    {
                      columns: [
                        {
                          width: 15,
                          image:
                            event_doc_status === 3 ? logoUsed : logoNotUsed, // แทนด้วย base64 string //event_doc_status
                          verticalAlignment: "middle",
                          alignment: "center",
                          fit: [12, 12],
                        },
                        {
                          text: [
                            {
                              text: "รับ ",
                              bold: true,
                            },
                            "ก๊าซไม่อยู่ในข้อกำหนดคุณภาพก๊าซ",
                          ],
                          margin: [5, 0, 0, 0], // เว้นระยะจากรูป
                          alignment: "left",
                        },
                      ],
                      margin: [0, 0, 0, 2],
                    },
                    {
                      columns: [
                        {
                          width: 15,
                          image:
                            event_doc_status === 4 ? logoUsed : logoNotUsed, // แทนด้วย base64 string
                          verticalAlignment: "middle",
                          alignment: "center",
                          fit: [12, 12],
                        },
                        {
                          text: [
                            {
                              text: "ปฏิเสธ ",
                              bold: true,
                            },
                            "ก๊าซไม่อยู่ในข้อกำหนดคุณภาพก๊าซ (ระบุชื่อลูกค้าที่ไม่สามารถใช้ก๊าซฯ ดังกล่าว)",
                          ],
                          margin: [5, 0, 0, 0], // เว้นระยะจากรูป
                          alignment: "left",
                        },
                      ],
                      margin: [0, 0, 0, 2],
                    },
                    // {
                    //   columns: [
                    //     {
                    //       width: 15,
                    //       image:
                    //         event_doc_status === 5 ? logoUsed : logoNotUsed, // แทนด้วย base64 string
                    //       verticalAlignment: 'middle',
                    //       alignment: 'center',
                    //       fit: [12, 12],
                    //     },
                    //     {
                    //       text: 'รับทราบ',
                    //       bold: true,
                    //       margin: [5, 0, 0, 0], // เว้นระยะจากรูป
                    //       alignment: 'left',
                    //     },
                    //   ],
                    //   margin: [0, 0, 0, 2],
                    // },
                    {
                      // text: `หมายเหตุ: ${input_note || '-'}`,
                      text: [
                        "หมายเหตุ : ",
                        {
                          text: input_note ? input_note : "_______________",
                          decoration: input_note && "underline",
                        },
                      ],
                      margin: [0, 5, 0, 2],
                    },
                    // {
                    //   text: 'สวัสดี...:',
                    //   margin: [0, 0, 0, 0],
                    //   // decoration: 'underline',
                    // },

                    // 'สวัสดี_______________________________________________________',
                    // '_______________________________________________________',
                  ],
                  margin: [5, 5, 5, 5],
                },
              ],
            ],
          },
          layout: {
            hLineWidth: () => 0.5,
            vLineWidth: () => 0.5,
          },
          margin: [0, 0, 0, 0],
        },

        // ======== กรอบช่องเซ็นชื่อ =========
        {
          table: {
            widths: ["*", "*"],
            body: [
              [
                {
                  stack: [
                    // // https://app.clickup.com/t/86eug8bw8
                    fromSignature
                      ? {
                          columns: [
                            {
                              text: "แจ้งโดย ",
                              width: "auto",
                              alignment: "right",
                            },
                            {
                              image: fromSignature, // base64 หรือ path
                              width: 50,
                              alignment: "center",
                            },
                            {
                              text: "",
                              width: "auto",
                              alignment: "left",
                            },
                          ],
                          columnGap: 15, // ระยะห่างระหว่างวงเล็บกับภาพ
                          margin: [0, 2, 0, 5], // ปรับระยะรอบภาพ
                        }
                      : {
                          text: `แจ้งโดย `,
                        },
                    {
                      text: fromFullname
                        ? `( ${fromFullname} )`
                        : `(                                   )`,
                    },
                    {
                      text: `หน่วยงาน ${fromCompany} (ผู้ให้บริการ)`,
                    },
                    {
                      text: `เวลา : ${fromDate.format("HH:mm")} น. วันที่/เดือน/ปี: ${fromDate.format("DD")} / ${fromDate.format("MM")} / ${fromDate.format("BB")}`,
                    },
                  ],
                  margin: [5, 5, 5, 5],
                },
                {
                  stack: [
                    toSignature
                      ? {
                          columns: [
                            {
                              text: "รับทราบโดย",
                              width: "auto",
                              alignment: "right",
                            },
                            {
                              image: toSignature, // base64 หรือ path
                              width: 50,
                              alignment: "center",
                            },
                            {
                              text: "",
                              width: "auto",
                              alignment: "left",
                            },
                          ],
                          columnGap: 15, // ระยะห่างระหว่างวงเล็บกับภาพ
                          margin: [0, 2, 0, 5], // ปรับระยะรอบภาพ
                        }
                      : {
                          text: `รับทราบโดย`,
                        },
                    {
                      text: toFullname
                        ? `( ${toFullname} )`
                        : `(                                   )`,
                    },

                    {
                      text: `หน่วยงาน ${rdoc1Find?.event_doc_status?.id === 2 ? " " : toCompany} (ผู้ใช้บริการ)`,
                    },
                    {
                      text: `เวลา : ${rdoc1Find?.event_doc_status?.id === 2 ? " " : toDate.format("HH:mm")} น. วันที่/เดือน/ปี: ${rdoc1Find?.event_doc_status?.id === 2 ? " " : toDate.format("DD")} / ${rdoc1Find?.event_doc_status?.id === 2 ? " " : toDate.format("MM")} / ${rdoc1Find?.event_doc_status?.id === 2 ? " " : toDate.format("BB")}`,
                    },
                  ],
                  margin: [5, 5, 5, 5],
                },
              ],
            ],
          },
          layout: {
            hLineWidth: () => 0.5,
            vLineWidth: () => 0.5,
          },
          margin: [0, 0, 0, 0],
        },

        // ======== Footer ========
        // {
        //   text: 'F–บก.บกคด.–0023 ประกาศใช้ 05/11/2564 เวอร์ชั่น 4',
        //   alignment: 'left',
        //   fontSize: 10,
        //   bold: true,
        //   margin: [0, 10, 0, 0],
        // },
      ],
      defaultStyle: {
        font: "THSarabun",
        fontSize: 14,
      },
    };

    return docDefinition;

}

// DOC.3 done
export function PdfDoc3({ data }: any) {

  const shipperIdArr = data?.data?.[0]?.item?.shipper || []

  return <UiRedderPDF pdfUrlArr={shipperIdArr.map((e:any, ix:number) => {
    return   {
      ix: ix,
      shipperId: (data?.shipperData || [])?.find((f:any) => f?.id === e)?.id || null,
      shipperName: (data?.shipperData || [])?.find((f:any) => f?.id === e)?.name || null,
      pdfUrl: <PDFMiddleCustom docDefinition={PdfDoc3Used({shipper: (data?.shipperData || [])?.find((f:any) => f?.id === e) || null, data})} />
    }
  })} />;
 
}

const PdfDoc3Used = ({ shipper, data }: any) => {
    const group: any = null;
    const groupId: any = null;
    const logoImage = `data:image/png;base64,${logoPtt}`;
    const logoUsed = `data:image/png;base64,${used}`;
    const logoNotUsed = `data:image/png;base64,${notUsed}`;
    const shipperNameArr = shipper?.name || "";
    const document_code_doc3 = `${data?.dataOpenDocument?.event_runnumber?.event_nember || "……"}/${data?.dataOpenDocument?.document_code || "……"}-${shipperNameArr || "……"}`;
    const rdoc1Find: any = {
      ...data?.data?.[0]?.item
    };

      // const fDoc2 = findRunnumber?.event_document?.filter((f: any) => f?.event_doc_master_id === 2)
      // const fDoc1 = findRunnumber?.event_document?.filter((f: any) => f?.event_doc_master_id === 1)
      // const document_code_arr = (fDoc2?.length > 0 ? fDoc2 : fDoc1 || [])?.find((f: any) => f?.group?.id === groupId)

      // const document_code_num = fDoc2?.length > 0 ? 2 : 1
      const document_code_num = "……"
      const document_code = `${data?.dataOpenDocument?.event_runnumber?.event_nember || "……"}/${"……"}-${"……"}`

      const event_document_action = rdoc1Find?.event_document_action

      const toAction = event_document_action?.find((f: any) => (f?.user_type_id === 3 || f?.user_type_id === 4) && f?.group_id === groupId && f?.event_doc_status_id !== 2)
      const toGroupName = toAction?.group?.name || ''

      const toFullname = toAction?.event_doc_status_id !== 1 && toAction?.event_doc_status_id !== 2 && toAction?.create_by_account?.first_name && toAction?.create_by_account?.last_name ? `${toAction?.create_by_account?.first_name} ${toAction?.create_by_account?.last_name}` : ''

      // const toCompany = (toAction?.group?.company_name && toAction?.group?.company_name) || ''
      const userType_ = toAction?.group?.user_type_id // (userType_ === 3 ? ' Shipper' : "")
      const toCompany = (shipperNameArr && shipperNameArr + (userType_ === 3 ? ' Shipper' : "")) || ''
      const toDate = dayjs().locale('th')
      const toSignature = '' //

      const fromFullnameH = "……………………………………………………"
      const fromCompany = (data?.dataOpenDocument?.create_by_account?.account_manage?.[0]?.user_type_id !== 3 && data?.dataOpenDocument?.create_by_account?.account_manage?.[0]?.user_type_id !== 4) ? 'PTT TSO' : rdoc1Find?.group?.name ? (rdoc1Find?.group?.name + (userType_ === 3 ? ' Shipper' : "")) : ''

      const fromSignature = '' // แจ้งโดย

      const fromDate = dayjs(rdoc1Find?.create_date).locale('th')

      // - - - -

      const event_runnumber = dayjs(rdoc1Find?.event_date).locale('th')
      const input_shipper_doc_number = rdoc1Find?.doc3_input_shipper_doc_number
      const input_shipper_doc_quality = rdoc1Find?.doc3_input_shipper_doc_quality
      const input_shipper_down_date =
        rdoc1Find?.doc3_input_shipper_down_date && `${dayjs(rdoc1Find?.doc3_input_shipper_down_date).locale('th').format('DD')} / ${dayjs(rdoc1Find?.doc3_input_shipper_down_date).locale('th').format('MMM')} ${dayjs(rdoc1Find?.doc3_input_shipper_down_date).locale('th').format('BBBB')}`
      const input_shipper_time_event_end_date =
        rdoc1Find?.doc3_input_shipper_time_event_end_date &&
        `${dayjs(rdoc1Find?.doc3_input_shipper_time_event_end_date).locale('th').format('DD')} / ${dayjs(rdoc1Find?.doc3_input_shipper_time_event_end_date).locale('th').format('MMM')} / ${dayjs(rdoc1Find?.doc3_input_shipper_time_event_end_date).locale('th').format('BBBB')}`
      const input_shipper_time_event_end_time = rdoc1Find?.doc3_input_shipper_time_event_end_time
      const input_shipper_time_event_start_date =
        rdoc1Find?.doc3_input_shipper_time_event_start_date &&
        `${dayjs(rdoc1Find?.doc3_input_shipper_time_event_start_date).locale('th').format('DD')} / ${dayjs(rdoc1Find?.doc3_input_shipper_time_event_start_date).locale('th').format('MMM')} / ${dayjs(rdoc1Find?.doc3_input_shipper_time_event_start_date).locale('th').format('BBBB')}`
      const input_shipper_time_event_start_time = rdoc1Find?.doc3_input_shipper_time_event_start_time
      const input_shipper_time_event_summary = rdoc1Find?.doc3_input_shipper_time_event_summary
      const input_tso_disapeared_date =
        rdoc1Find?.doc3_input_tso_disapeared_date && `${dayjs(rdoc1Find?.doc3_input_tso_disapeared_date).locale('th').format('DD')} / ${dayjs(rdoc1Find?.doc3_input_tso_disapeared_date).locale('th').format('MMM')} / ${dayjs(rdoc1Find?.doc3_input_tso_disapeared_date).locale('th').format('BBBB')}`
      const input_tso_disapeared_time = rdoc1Find?.doc3_input_tso_disapeared_time
      const input_tso_doc_number = rdoc1Find?.doc3_input_tso_doc_number
      const input_tso_down_date = rdoc1Find?.doc3_input_tso_down_date && `${dayjs(rdoc1Find?.doc3_input_tso_down_date).locale('th').format('DD')} / ${dayjs(rdoc1Find?.doc3_input_tso_down_date).locale('th').format('MMM')} ${dayjs(rdoc1Find?.doc3_input_tso_down_date).locale('th').format('BBBB')}`
      const input_notifyby = rdoc1Find?.doc3_input_notifyby
      const input_shipper_cpn_name = rdoc1Find?.doc3_input_shipper_cpn_name

      const longdo_dict = rdoc1Find?.longdo_dict //สำเนา

      ;(pdfMake as any).vfs = vfs
      const fonts = {
        THSarabun: {
          normal: 'THSarabunNew.ttf',
          bold: 'THSarabunNew-Bold.ttf',
          italics: 'THSarabunNew.ttf',
          bolditalics: 'THSarabunNew-Bold.ttf'
        }
      }
      ;(pdfMake as any).fonts = fonts
      const docDefinition = {
        header: (currentPage:any, pageCount:any) => {
          return {
            columns: [
              {
                width: '*',
                text: ''
              }, // เว้นซ้าย
              {
                width: 'auto',
                stack: [
                  {
                    // text: `เลขที่เอกสาร: …………${event_nember}…………`,
                    text: `เลขที่เอกสาร: …………${document_code_doc3}…………`,
                    fontSize: 12,
                    alignment: 'right'
                  },
                  {
                    text: `วันเดือนปีเอกสาร: ……${event_runnumber.format('DD')}…/……${event_runnumber.format('MMM')}……${event_runnumber.format('BBBB')}…………`,
                    fontSize: 12,
                    alignment: 'right'
                  }
                ],
                margin: [0, 5, 10, 0] // [left, top, right, bottom],
              }
            ]
          }
        },
        content: [
          {
            image: logoImage,
            width: 70,
            alignment: 'center',
            margin: [0, 0, 0, 10]
          },

          {
            text: 'เอกสารแจ้งเตือนคุณภาพก๊าซฯ 3',
            alignment: 'center',
            fontSize: 18,
            bold: true,
            margin: [0, 0, 0, 5]
          },

          {
            text: 'เอกสารแจ้งคุณภาพก๊าซหรือปริมาณก๊าซนำเข้ากลับเป็นปกติ',
            alignment: 'center',
            margin: [0, 0, 0, 10]
          },

          // ======== กรอบ "เรียน / สำเนา" =========
          {
            table: {
              widths: ['auto', '*'],
              body: [
                [
                  {
                    // text: `เรียน: ${toGroupName}`,
                    text: `เรียน: `,
                    bold: true,
                    alignment: 'center',
                    verticalAlignment: 'middle',
                    margin: [0, 10, 0, 10]
                  },
                  {
                    // stack: [`${group?.name}`, `${toCompany}`],
                    stack: [`${shipperNameArr}`]
                    // margin: [0, 10, 0, 10], // << บังคับความสูงให้จัดกลาง
                  }
                ],
                [
                  {
                    text: 'สำเนา:',
                    bold: true,
                    alignment: 'center',
                    verticalAlignment: 'middle',
                    margin: [0, 10, 0, 10]
                  },
                  {
                    stack: [`${longdo_dict || ''}`],
                    margin: [0, 10, 0, 10] // << บังคับความสูงให้จัดกลาง
                  }
                ]
              ]
            },
            layout: {
              hLineWidth: () => 0.5,
              vLineWidth: () => 0.5
            },
            margin: [0, 0, 0, 0]
          },

          // ! ======== กรอบ "ส่วนของผู้ใช้บริการ / ผู้ให้บริการ (ผู้ทีท าให้เกิดเหตุการณ์)" =========
          {
            table: {
              widths: ['*'],
              body: [
                [
                  {
                    stack: [
                      {
                        text: 'ส่วนของผู้ใช้บริการ / ผู้ให้บริการ (ผู้ที่ทำให้เกิดเหตุการณ์)',
                        bold: true,
                        decoration: 'underline',
                        margin: [0, 0, 0, 5]
                      },
                      {
                        text: [
                          {
                            text: `space`,
                            opacity: 0
                          },
                          {
                            // text: `ตามที่ ${input_shipper_cpn_name} ได้แจ้งเรื่องคุณภาพก๊าซไม่อยู่ในข้อกำหนดคุณภาพก๊าซ / ปริมาณก๊าซนำเข้าเบี่ยงเบนจาก Nomination มากกว่าเกณฑ์ที่กำหนด ดังรายละเอียดในเอกสารเลขที่ ${input_shipper_doc_number} (เอกสารแจ้งเตือนคุณภาพ ${input_shipper_doc_quality} ) ลงวันที่ ${input_shipper_down_date}`,
                            text: [
                              'ตามที่ ',
                              {
                                text: input_shipper_cpn_name ? input_shipper_cpn_name : '____________',
                                decoration: input_shipper_cpn_name && 'underline'
                              },
                              ' ได้แจ้งเรื่องคุณภาพก๊าซไม่อยู่ในข้อกำหนดคุณภาพก๊าซ / ปริมาณก๊าซนำเข้าเบี่ยงเบนจาก Nomination มากกว่าเกณฑ์ที่กำหนด ดังรายละเอียดในเอกสารเลขที่ ',
                              {
                                // text: input_shipper_doc_number ? input_shipper_doc_number : '____________',
                                // decoration: input_shipper_doc_number && 'underline'
                                text: document_code ? document_code : '____________',
                                decoration: document_code && 'underline'
                              },
                              ' (เอกสารแจ้งเตือนคุณภาพ ',
                              {
                                // text: input_shipper_doc_quality ? input_shipper_doc_quality : '____________',
                                text: document_code_num ? document_code_num : '____________',
                                decoration: input_shipper_doc_quality && 'underline'
                              },
                              ' ) ลงวันที่ ',
                              {
                                text: input_shipper_down_date ? input_shipper_down_date : '____________',
                                decoration: input_shipper_down_date && 'underline'
                              }
                            ]
                          }
                        ],
                        margin: [0, 0, 0, 5],
                        alignment: 'justify'
                      },
                      {
                        text: [
                          {
                            text: `space`,
                            opacity: 0
                          },
                          {
                            text: `บัดนี้ คุณภาพก๊าซดังกล่าว มีคุณภาพ / ปริมาณเป็นไปตามข้อกำหนด / เกณฑ์ที่กำหนด โดยมีข้อสรุปดังนี้ `
                          }
                        ],
                        margin: [0, 0, 0, 5],
                        alignment: 'justify'
                      },
                      {
                        ul: [
                          {
                            text: [
                              {
                                // text: `ช่วงเวลาของเหตุการณ์: วันที่ ${input_shipper_time_event_start_date} เวลา ${input_shipper_time_event_start_time} น. ถึง วันที่ ${input_shipper_time_event_end_date} เวลา ${input_shipper_time_event_end_time} น.`,
                                text: [
                                  'ช่วงเวลาของเหตุการณ์: วันที่ ',
                                  {
                                    text: input_shipper_time_event_start_date ? input_shipper_time_event_start_date : '____________',
                                    decoration: input_shipper_time_event_start_date && 'underline'
                                  },
                                  ' เวลา ',
                                  {
                                    text: input_shipper_time_event_start_time ? input_shipper_time_event_start_time : '____________',
                                    decoration: input_shipper_time_event_start_time && 'underline'
                                  },
                                  ' น. ถึง วันที่ ',
                                  {
                                    text: input_shipper_time_event_end_date ? input_shipper_time_event_end_date : '____________',
                                    decoration: input_shipper_time_event_end_date && 'underline'
                                  },
                                  ' เวลา ',
                                  {
                                    text: input_shipper_time_event_end_time ? input_shipper_time_event_end_time : '____________',
                                    decoration: input_shipper_time_event_end_time && 'underline'
                                  },
                                  ' น. '
                                ]
                              }
                            ],
                            margin: [22, 0, 0, 0]
                          },
                          {
                            text: [
                              {
                                // text: `สรุปการแก้ไข: ${input_shipper_time_event_summary}`,
                                text: [
                                  'สรุปการแก้ไข: ',
                                  {
                                    text: input_shipper_time_event_summary ? input_shipper_time_event_summary : '____________',
                                    decoration: input_shipper_time_event_summary && 'underline'
                                  }
                                ]
                              }
                            ],
                            margin: [22, 0, 0, 0]
                          }
                        ]
                      }
                    ],
                    margin: [5, 5, 5, 5]
                  }
                ]
              ]
            },
            layout: {
              hLineWidth: () => 0.5,
              vLineWidth: () => 0.5
            },
            margin: [0, 0, 0, 0]
          },

          // ! ======== กรอบ "ส่วนของผู้ให้บริการ" =========
          {
            table: {
              widths: ['*'],
              body: [
                [
                  {
                    stack: [
                      {
                        text: 'ส่วนของผู้ให้บริการ',
                        bold: true,
                        decoration: 'underline',
                        margin: [0, 0, 0, 5]
                      },

                      {
                        text: [
                          {
                            text: `space`,
                            opacity: 0
                          },
                          {
                            // text: `ตามที่ส่วนบริหารและควบคุมระบบส่งก๊าซ (บค.บคต.) ได้แจ้งคุณภาพก๊าซผสม ไม่อยู่ในข้อกำหนดคุณภาพก๊าซของ TSO Code ดังรายละเอียดในเอกสารเลขที่ ${input_tso_doc_number} (เอกสารแจ้งเตือนคุณภาพ 2) ${input_tso_down_date}`,
                            text: [
                              'ตามที่ส่วนบริหารและควบคุมระบบส่งก๊าซ (บค.บคต.) ได้แจ้งคุณภาพก๊าซผสม ไม่อยู่ในข้อกำหนดคุณภาพก๊าซของ TSO Code ดังรายละเอียดในเอกสารเลขที่ ',
                              {
                                // text: input_tso_doc_number ? input_tso_doc_number : '____________',
                                // decoration: input_tso_doc_number && 'underline'
                                text: document_code ? document_code : '____________',
                                decoration: document_code && 'underline'
                              },
                              ` (เอกสารแจ้งเตือนคุณภาพ ${document_code_num}) `,
                              {
                                text: input_tso_down_date ? input_tso_down_date : '____________',
                                decoration: input_tso_down_date && 'underline'
                              }
                            ]
                          }
                        ],
                        margin: [0, 0, 0, 5],
                        alignment: 'justify'
                      },
                      {
                        text: [
                          {
                            text: `space`,
                            opacity: 0
                          },
                          {
                            // text: `โดยก๊าซฯที่ไม่อยู่ในคุณสมบัติที่กำหนดตามข้อกำหนด TSO Code ได้หมดไปจากระบบส่งก๊าซฯ เมื่อ วันที่ ${input_tso_disapeared_date} เวลา ${input_tso_disapeared_time} น.`,
                            text: [
                              'โดยก๊าซฯที่ไม่อยู่ในคุณสมบัติที่กำหนดตามข้อกำหนด TSO Code ได้หมดไปจากระบบส่งก๊าซฯ เมื่อ วันที่ ',
                              {
                                text: input_tso_disapeared_date ? input_tso_disapeared_date : '____________',
                                decoration: input_tso_disapeared_date && 'underline'
                              },
                              ' เวลา ',
                              {
                                text: input_tso_disapeared_time ? input_tso_disapeared_time : '____________',
                                decoration: input_tso_disapeared_time && 'underline'
                              },
                              ' น. '
                            ]
                          }
                        ],
                        margin: [0, 0, 0, 5],
                        alignment: 'justify'
                      }
                    ],
                    margin: [5, 5, 5, 5]
                  }
                ]
              ]
            },
            layout: {
              hLineWidth: () => 0.5,
              vLineWidth: () => 0.5
            },
            margin: [0, 0, 0, 0]
          },

          // ======== กรอบช่องเซ็นชื่อ =========
          {
            table: {
              widths: ['*', '*', '*'],
              body: [
                [
                  {
                    stack: [
                      // https://app.clickup.com/t/86eug8cfe
                      (rdoc1Find?.user_type_id === 2 || rdoc1Find?.user_type_id === 1)
                        ? {
                            text: `แจ้งโดย (PTT TSO)`
                          } // (PTT TSO) https://app.clickup.com/t/86eum0pbr
                        : fromSignature
                          ? {
                              columns: [
                                {
                                  text: 'แจ้งโดย ',
                                  width: 'auto',
                                  alignment: 'right'
                                },
                                {
                                  image: fromSignature, // base64 หรือ path
                                  width: 50,
                                  alignment: 'center'
                                },
                                {
                                  text: '',
                                  width: 'auto',
                                  alignment: 'left'
                                }
                              ],
                              columnGap: 5, // ระยะห่างระหว่างวงเล็บกับภาพ
                              margin: [0, 2, 0, 5] // ปรับระยะรอบภาพ
                            }
                          : {
                              text: `แจ้งโดย `
                            },

                      {
                        text: fromFullnameH ? `( ${fromFullnameH} )` : `(                                   )`
                      },
                      {
                        text: `หน่วยงาน ${fromCompany}`
                      }, // https://app.clickup.com/t/86eum0pah
                      {
                        text: `วันที่เดือนปี: ${fromDate.format('DD')} / ${fromDate.format('MM')} / ${fromDate.format('BB')}`
                      },
                      {
                        text: `เวลา : ${fromDate.format('HH:mm')} น.`
                      }
                    ],
                    margin: [5, 5, 5, 5]
                  },

                  {
                    stack: [
                      // https://app.clickup.com/t/86eug8cfe
                      toSignature && toFullname
                        ? {
                            columns: [
                              {
                                text: 'รับทราบโดย',
                                width: 'auto',
                                alignment: 'right'
                              },
                              {
                                image: toSignature, // base64 หรือ path
                                width: 50,
                                alignment: 'center'
                              },
                              {
                                text: '',
                                width: 'auto',
                                alignment: 'left'
                              }
                            ],
                            columnGap: 5, // ระยะห่างระหว่างวงเล็บกับภาพ
                            margin: [0, 2, 0, 5] // ปรับระยะรอบภาพ
                          }
                        : {
                            text: `รับทราบโดย`
                          },
                      {
                        text: toGroupName && toFullname ? `( ${toGroupName} )` : `(                                   )`
                      },

                      // { text: `หน่วยงาน ${toCompany} (ผู้ให้บริการ)` },
                      {
                        text: `หน่วยงาน ${toCompany}`
                      }, // https://app.clickup.com/t/86evh20h8
                      {
                        text: `วันที่เดือนปี: ${!!!toFullname ? ' ' : toDate.format('DD')} / ${!!!toFullname ? ' ' : toDate.format('MM')} / ${!!!toFullname ? ' ' : toDate.format('BB')}`
                      },
                      {
                        text: `เวลา : ${!!!toFullname ? ' ' : toDate.format('HH:mm')} น.`
                      }
                    ],
                    margin: [5, 5, 5, 5]
                  },
                  {
                    stack: [
                      {
                        text: `รับทราบโดย`
                      },
                      {
                        text: `…………………………………………`
                      },
                      {
                        text: `(                                   )`
                      },
                      {
                        text: `หน่วยงาน ………………………………………`
                      },
                      {
                        text: `วันที่เดือนปี : ………/…………/…………`
                      },
                      {
                        text: `เวลา : ………………………………………`
                      }
                    ],
                    margin: [5, 5, 5, 5]
                  }
                ]
              ]
            },
            layout: {
              hLineWidth: () => 0.5,
              vLineWidth: () => 0.5
            },
            margin: [0, 0, 0, 0]
          }

          // // ======== Footer ========
          // {
          //   text: 'F–บก.บกคด.–0023 ประกาศใช้ 05/11/2564 เวอร์ชั่น 4',
          //   alignment: 'left',
          //   fontSize: 10,
          //   bold: true,
          //   margin: [0, 10, 0, 0],
          // },
        ],
        defaultStyle: {
          font: 'THSarabun',
          fontSize: 14
        }
      }

    return docDefinition;

}

// DOC.3.9 done
export function PdfDoc309({ data }: any) {

  const shipperIdArr = data?.data?.[0]?.item?.shipper || []

  return <UiRedderPDF pdfUrlArr={shipperIdArr.map((e:any, ix:number) => {
    return   {
      ix: ix,
      shipperId: (data?.shipperData || [])?.find((f:any) => f?.id === e)?.id || null,
      shipperName: (data?.shipperData || [])?.find((f:any) => f?.id === e)?.name || null,
      pdfUrl: <PDFMiddleCustom docDefinition={PdfDoc309Used({shipper: (data?.shipperData || [])?.find((f:any) => f?.id === e) || null, data})} />
    }
  })} />;
 
}

const PdfDoc309Used = ({ shipper, data }: any) => {
    // "……"
    // "……………………………………………………"
    const group: any = null;
    const groupId: any = null;
    const logoImage = `data:image/png;base64,${logoPtt}`;
    const logoUsed = `data:image/png;base64,${used}`;
    const logoNotUsed = `data:image/png;base64,${notUsed}`;
    const shipperNameArr = shipper?.name || "";
    const document_code_doc39 = `${data?.dataOpenDocument?.event_runnumber_emer?.event_nember || "……"}/${data?.dataOpenDocument?.document_code || "……"}-${shipperNameArr || "……"}`;
    const rdoc1Find: any = {
      ...data?.data?.[0]?.item
    };

      const groupName = shipperNameArr

      const toFullname = "……………………………………………………"
      
      const userType_ = data?.dataOpenDocument?.group?.user_type_id // (userType_ === 3 ? ' Shipper' : "")
      const toName = (shipper?.name && shipper?.name + (userType_ === 3 ? ' Shipper' : "")) || ''
      const toDate = dayjs().locale('th')
      const toSignature = '' //

      // ----
      const fromFullname = "……………………………………………………"
      const fromSignature = '' //

      const fromDate = dayjs(rdoc1Find?.create_date).locale('th')

      const event_nember = rdoc1Find?.event_nember
      const event_doc_status = rdoc1Find?.event_doc_status?.id // 3 accept, 4 reject, 5 Acknowledge
      const event_runnumber = dayjs(rdoc1Find?.event_date).locale('th')

      const event_doc_emer_type_id = rdoc1Find?.event_doc_emer_type_id

      const event_doc_emer_gas_tranmiss_other = rdoc1Find?.event_doc_emer_gas_tranmiss_other || ''
      const event_doc_emer_gas_tranmiss_id = rdoc1Find?.event_doc_emer_gas_tranmiss_id

      const input_date_time_of_the_incident = rdoc1Find?.doc_39_input_date_time_of_the_incident
      const input_incident = rdoc1Find?.doc_39_input_incident
      const input_detail_incident = rdoc1Find?.doc_39_input_detail_incident
      const input_expected_day_time = rdoc1Find?.doc_39_input_expected_day_time
      const input_note = rdoc1Find?.doc_39_input_note
      const input_shipper_operation = rdoc1Find?.doc_39_input_shipper_operation
      const input_shipper_note = rdoc1Find?.doc_39_input_shipper_note

      const longdo_dict = rdoc1Find?.longdo_dict || '' //สำเนา

      ;(pdfMake as any).vfs = vfs
      const fonts = {
        THSarabun: {
          normal: 'THSarabunNew.ttf',
          bold: 'THSarabunNew-Bold.ttf',
          italics: 'THSarabunNew.ttf',
          bolditalics: 'THSarabunNew-Bold.ttf'
        }
      }
      ;(pdfMake as any).fonts = fonts
      const docDefinition = {
        header: (currentPage:any, pageCount:any) => {
          return {
            columns: [
              {
                width: '*',
                text: ''
              }, // เว้นซ้าย
              {
                width: 'auto',
                stack: [
                  {
                    // text: `เลขที่เอกสาร: …………${event_nember}…………`,
                    text: `เลขที่เอกสาร: …………${document_code_doc39}…………`,
                    fontSize: 12,
                    alignment: 'right'
                  },
                  {
                    text: `วันเดือนปีเอกสาร: ……${event_runnumber.format('DD')}…/……${event_runnumber.format('MMM')}……${event_runnumber.format('BBBB')}…………`,
                    fontSize: 12,
                    alignment: 'right'
                  }
                ],
                margin: [0, 5, 10, 0] // [left, top, right, bottom],
              }
            ]
          }
        },
        content: [
          {
            image: logoImage,
            width: 70,
            alignment: 'center',
            margin: [0, 0, 0, 10]
          },

          {
            text: 'เอกสารแจ้งเหตุการณ์ฉุกเฉิน/เหตุการณ์ความไม่สมดุลอย่างรุนแรง 1',
            alignment: 'center',
            fontSize: 18,
            bold: true,
            margin: [0, 0, 0, 5]
          },
          {
            text: '(เอกสารด่วน)',
            alignment: 'center',
            fontSize: 18,
            bold: true,
            margin: [0, 0, 0, 5],
            color: 'red' // หรือใช้โค้ด HEX เช่น '#'
          },

          {
            columns: [
              {
                width: 15,
                image: event_doc_emer_type_id === 1 ? logoUsed : logoNotUsed, // แทนด้วย base64 string //event_doc_status
                verticalAlignment: 'middle',
                alignment: 'center',
                fit: [12, 12]
              },
              {
                text: [
                  {
                    text: 'เหตุการณ์ไม่สมดุลอย่างรุนแรง (Difficult Day) ',
                    bold: true,
                    fontSize: 18
                  }
                ],
                margin: [5, 0, 0, 0], // เว้นระยะจากรูป
                alignment: 'left'
              },
              {
                width: 15,
                image: event_doc_emer_type_id === 2 ? logoUsed : logoNotUsed, // แทนด้วย base64 string //event_doc_status
                verticalAlignment: 'middle',
                alignment: 'center',
                fit: [12, 12]
              },
              {
                text: [
                  {
                    text: 'ภาวะฉุกเฉิน (Emergency) ',
                    bold: true,
                    fontSize: 18
                  }
                ],
                margin: [5, 0, 0, 0], // เว้นระยะจากรูป
                alignment: 'left'
              }
            ],
            margin: [0, 0, 0, 2]
          },

          // ======== กรอบ "เรียน / สำเนา" =========
          {
            table: {
              widths: ['auto', '*'],
              body: [
                [
                  {
                    text: 'ส่ง:',
                    bold: true,
                    alignment: 'center',
                    verticalAlignment: 'middle',
                    margin: [0, 10, 0, 10]
                  },
                  {
                    stack: [
                      `${groupName}`
                      // 'โรงไฟฟ้าพลังความร้อนร่วมบางปะกงชุดที่ 1 (BPK-C1)',
                    ],
                    margin: [0, 10, 0, 10] // << บังคับความสูงให้จัดกลาง
                  }
                ],
                [
                  {
                    text: 'สำเนา:',
                    bold: true,
                    alignment: 'center',
                    verticalAlignment: 'middle',
                    margin: [0, 10, 0, 10]
                  },
                  {
                    stack: [`${longdo_dict || ''}`],
                    margin: [0, 10, 0, 10] // << บังคับความสูงให้จัดกลาง
                  }
                ]
              ]
            },
            layout: {
              hLineWidth: () => 0.5,
              vLineWidth: () => 0.5
            },
            margin: [0, 0, 0, 0]
          },

          // ======== กรอบ "ระบบส่งก๊าซ" =========
          {
            table: {
              widths: ['*'],
              body: [
                [
                  {
                    stack: [
                      {
                        text: 'ระบบส่งก๊าซ',
                        bold: true,
                        // decoration: 'underline',
                        margin: [0, 0, 0, 5]
                      },
                      {
                        columns: [
                          {
                            width: 15,
                            image: event_doc_emer_gas_tranmiss_id === 1 ? logoUsed : logoNotUsed, // แทนด้วย base64 string //event_doc_status
                            verticalAlignment: 'middle',
                            alignment: 'center',
                            fit: [12, 12]
                          },
                          {
                            text: [
                              {
                                text: 'Onshore East',
                                bold: true
                              }
                            ],
                            margin: [5, 0, 0, 0], // เว้นระยะจากรูป
                            alignment: 'left'
                          },
                          //
                          {
                            width: 15,
                            image: event_doc_emer_gas_tranmiss_id === 2 ? logoUsed : logoNotUsed, // แทนด้วย base64 string
                            verticalAlignment: 'middle',
                            alignment: 'center',
                            fit: [12, 12]
                          },
                          {
                            text: [
                              {
                                text: 'Onshore West',
                                bold: true
                              }
                            ],
                            margin: [5, 0, 0, 0], // เว้นระยะจากรูป
                            alignment: 'left'
                          },
                          //
                          {
                            width: 15,
                            image: event_doc_emer_gas_tranmiss_id === 3 ? logoUsed : logoNotUsed, // แทนด้วย base64 string
                            verticalAlignment: 'middle',
                            alignment: 'center',
                            fit: [12, 12]
                          },
                          {
                            text: 'Onshore East - West',
                            bold: true,
                            margin: [5, 0, 0, 0], // เว้นระยะจากรูป
                            alignment: 'left'
                          }
                        ]
                        // margin: [0, 0, 0, 2],
                      },

                      {
                        columns: [
                          {
                            width: 15,
                            image: event_doc_emer_gas_tranmiss_id === 4 ? logoUsed : logoNotUsed, // แทนด้วย base64 string
                            verticalAlignment: 'middle',
                            alignment: 'center',
                            fit: [12, 12]
                          },
                          {
                            text: `Other: ${event_doc_emer_gas_tranmiss_other || ''}`,
                            bold: true,
                            margin: [5, 0, 0, 0], // เว้นระยะจากรูป
                            alignment: 'left'
                          }
                        ]
                        // margin: [0, 0, 0, 2],
                      }
                    ],
                    margin: [5, 5, 5, 5]
                  }
                ]
              ]
            },
            layout: {
              hLineWidth: () => 0.5,
              vLineWidth: () => 0.5
            },
            margin: [0, 0, 0, 0]
          },

          // ======== กรอบ "ส่วนของผู้ให้บริการ" =========
          {
            table: {
              widths: ['*'],
              body: [
                [
                  {
                    stack: [
                      {
                        text: 'ส่วนของผู้ให้บริการ',
                        bold: true,
                        decoration: 'underline',
                        margin: [0, 0, 0, 5]
                      },
                      {
                        text: [
                          {
                            text: `space`,
                            opacity: 0
                          },
                          {
                            text: [
                              'เนื่องด้วยในวันที่/เวลา:  ',
                              {
                                text: input_date_time_of_the_incident ? input_date_time_of_the_incident : '____________',
                                decoration: input_date_time_of_the_incident && 'underline'
                              },
                              ' ได้เกิดเหตุการณ์ไม่สมดุลอย่างรุนแรง / ภาวะฉุกเฉิน ซึ่งมีรายละเอียดดังนี้ '
                            ]
                          }
                        ],
                        margin: [0, 0, 0, 5],
                        alignment: 'left'
                      },
                      {
                        text: [
                          // { text: `space`, opacity: 0 },
                          {
                            text: 'สถานที่เกิดเหตุ: ',
                            bold: true
                            // margin: [0, 0, 0, 5],
                          },
                          {
                            // text: `${input_incident}`,
                            text: [
                              {
                                text: input_incident ? input_incident : '____________',
                                decoration: input_incident && 'underline'
                              }
                            ]
                          }
                        ],
                        margin: [0, 0, 0, 5],
                        alignment: 'left'
                      },
                      {
                        text: [
                          // { text: `space`, opacity: 0 },
                          {
                            text: 'รายละเอียดของเหตุการณ์และผลกระทบต่อระบบส่งก๊าซ:',
                            bold: true,
                            alignment: 'left'
                          },
                          {
                            text: input_detail_incident ? input_detail_incident : '____________',
                            decoration: input_detail_incident && 'underline',
                            // text: input_detail_incident || '______________________________',
                            // decoration: 'underline',
                            alignment: 'left'
                          }
                        ],
                        margin: [0, 0, 0, 5],
                        alignment: 'left'
                      },
                      {
                        text: [
                          // { text: `space`, opacity: 0 },
                          {
                            text: 'โดยคาดว่าจะแก้ไขปัญหาแล้วเสร็จในวันที่/เวลา: ',
                            bold: true
                            // margin: [0, 0, 0, 5],
                          },
                          {
                            // text: `${input_expected_day_time}`,
                            text: [
                              {
                                text: input_expected_day_time ? input_expected_day_time : '____________',
                                decoration: input_expected_day_time && 'underline'
                              }
                            ]
                          }
                        ],
                        margin: [0, 0, 0, 5],
                        alignment: 'left'
                      },
                      {
                        text: [
                          {
                            text: `หมายเหตุ:`,
                            bold: true,
                            decoration: 'underline',
                            fontSize: 10
                            // font
                          },
                          {
                            // text: `${input_note}`,
                            text: [
                              {
                                text: input_note ? input_note : '____________',
                                decoration: input_note && 'underline',
                                fontSize: 10
                              }
                            ]
                          }
                        ],
                        margin: [0, 0, 0, 5],
                        alignment: 'left'
                      }
                    ],
                    margin: [5, 5, 5, 5]
                  }
                ]
              ]
            },
            layout: {
              hLineWidth: () => 0.5,
              vLineWidth: () => 0.5
            },
            margin: [0, 0, 0, 0]
          },

          // ======== กรอบ "ส่วนของผู้ใช้บริการ" =========
          {
            table: {
              widths: ['*'],
              body: [
                [
                  {
                    stack: [
                      {
                        text: 'ส่วนของผู้ใช้บริการ / คู่สัญญาของผู้ใช้บริการ',
                        bold: true,
                        decoration: 'underline',
                        margin: [0, 0, 0, 5]
                      },
                      {
                        text: [
                          {
                            text: `space`,
                            opacity: 0
                          },
                          {
                            text: `การดำเนินการ: `,
                            bold: true
                          },
                          {
                            // text: `${input_shipper_operation}`,
                            text: [
                              {
                                text: input_shipper_operation ? input_shipper_operation : '____________',
                                decoration: input_shipper_operation && 'underline'
                              }
                            ]
                          }
                        ],
                        margin: [0, 0, 0, 5],
                        alignment: 'justify'
                      },
                      {
                        text: [
                          {
                            text: `space`,
                            opacity: 0
                          },
                          {
                            text: `หมายเหตุ: `,
                            bold: true
                          },
                          {
                            // text: `${input_shipper_note}`,
                            text: [
                              {
                                text: input_shipper_note ? input_shipper_note : '____________',
                                decoration: input_shipper_note && 'underline'
                              }
                            ]
                          }
                        ],
                        margin: [0, 0, 0, 5],
                        alignment: 'justify'
                      }
                    ],
                    margin: [5, 5, 5, 5]
                  }
                ]
              ]
            },
            layout: {
              hLineWidth: () => 0.5,
              vLineWidth: () => 0.5
            },
            margin: [0, 0, 0, 0]
          },

          // ======== กรอบช่องเซ็นชื่อ =========
          {
            table: {
              widths: ['*', '*'],
              body: [
                [
                  {
                    stack: [
                      fromSignature
                        ? {
                            columns: [
                              {
                                text: 'แจ้งโดย ',
                                width: 'auto',
                                alignment: 'right'
                              },
                              {
                                image: fromSignature, // base64 หรือ path
                                width: 50,
                                alignment: 'center'
                              },
                              {
                                text: '',
                                width: 'auto',
                                alignment: 'left'
                              }
                            ],
                            columnGap: 15, // ระยะห่างระหว่างวงเล็บกับภาพ
                            margin: [0, 2, 0, 5] // ปรับระยะรอบภาพ
                          }
                        : {
                            text: `แจ้งโดย`
                          },
                      {
                        text: fromFullname ? `( ${fromFullname} )` : `(                                   )`
                      },
                      {
                        // text: `หน่วยงาน ${fromCompany} (ผู้ให้บริการ)`
                        text: `หน่วยงาน PTT TSO (ผู้ให้บริการ)`
                      },
                      {
                        text: `เวลา : ${fromDate.format('HH:mm')} น. วันที่/เดือน/ปี: ${fromDate.format('DD')} / ${fromDate.format('MM')} / ${fromDate.format('BB')}`
                      }
                    ],
                    margin: [5, 5, 5, 5]
                  },
                  {
                    stack: [
                      toSignature
                        ? {
                            columns: [
                              {
                                text: 'รับทราบโดย',
                                width: 'auto',
                                alignment: 'right'
                              },
                              {
                                image: toSignature, // base64 หรือ path
                                fit: [40, 40],
                                margin: [0, 0, 0, 0],
                                alignment: 'left'
                              }
                            ],
                            columnGap: 5, // ระยะห่างระหว่างวงเล็บกับภาพ
                            margin: [0, 2, 0, 5] // ปรับระยะรอบภาพ
                          }
                        : {
                            text: `รับทราบโดย`
                          },
                      {
                        text: toFullname ? `( ${toFullname} )` : `(                                   )`
                      },
                      {
                        // text: `หน่วยงาน ${toCompany} (ผู้ใช้บริการ)`
                        text: `หน่วยงาน ${toName} (ผู้ใช้บริการ)`
                      },
                      {
                        text: `เวลา : ${toFullname && toDate.format('HH:mm')} น. วันที่/เดือน/ปี: ${toFullname && toDate.format('DD')} / ${toFullname && toDate.format('MM')} / ${toFullname && toDate.format('BB')}`
                      }
                    ],
                    margin: [5, 5, 5, 5]
                  }
                ]
              ]
            },
            layout: {
              hLineWidth: () => 0.5,
              vLineWidth: () => 0.5
            },
            margin: [0, 0, 0, 0]
          }

          // ======== Footer ========
          // {
          //   text: 'F–บก.บกคด.–0023 ประกาศใช้ 05/11/2564 เวอร์ชั่น 4',
          //   alignment: 'left',
          //   fontSize: 10,
          //   bold: true,
          //   margin: [0, 10, 0, 0],
          // },
        ],
        defaultStyle: {
          font: 'THSarabun',
          fontSize: 14,
          alignment: 'left'
          // characterSpacing: -0.5,
        }
      }

    return docDefinition;

}

// DOC.5 done
export function PdfDoc5({ data }: any) {

  const shipperIdArr = data?.data?.[0]?.item?.shipper || []

  return <UiRedderPDF pdfUrlArr={shipperIdArr.map((e:any, ix:number) => {
    return   {
      ix: ix,
      shipperId: (data?.shipperData || [])?.find((f:any) => f?.id === e)?.id || null,
      shipperName: (data?.shipperData || [])?.find((f:any) => f?.id === e)?.name || null,
      pdfUrl: <PDFMiddleCustom docDefinition={PdfDoc5Used({shipper: (data?.shipperData || [])?.find((f:any) => f?.id === e) || null, data})} />
    }
  })} />;
 
}

const PdfDoc5Used = ({ shipper, data }: any) => {
    // "……"
    // "……………………………………………………"
    const group: any = null;
    const groupId: any = null;
    const logoImage = `data:image/png;base64,${logoPtt}`;
    const logoUsed = `data:image/png;base64,${used}`;
    const logoNotUsed = `data:image/png;base64,${notUsed}`;
    const shipperNameArr = shipper?.name || "";
    const document_code_doc5 = `${data?.dataOpenDocument?.event_runnumber_emer?.event_nember || "……"}/${data?.dataOpenDocument?.document_code || "……"}-${shipperNameArr || "……"}`;
    const rdoc1Find: any = {
      ...data?.data?.[0]?.item
    };

      const groupName = shipperNameArr

      const event_document_action = rdoc1Find?.event_document_emer_action

      const toAction = event_document_action?.find((f: any) => (f?.user_type_id === 3 || f?.user_type_id === 4) && f?.group_id === groupId)
      const toFullname = "……………………………………………………"

      // const toCompany = (toAction?.group?.company_name && toAction?.group?.company_name) || ''
      const userType_ = toAction?.group?.user_type_id // (userType_ === 3 ? ' Shipper' : "")
      const toCompany = (shipperNameArr + (userType_ === 3 ? ' Shipper' : "")) || ''
      const toDate = dayjs(toAction?.create_date).locale('th')
      const toSignature = '' //

      // ----
      const fromFullname = "……………………………………………………"
      const fromCompany = 'PTT TSO'
      const fromSignature = '' //
      const fromDate = dayjs().locale('th')
      const event_doc_status = rdoc1Find?.event_doc_status?.id // 3 accept, 4 reject, 5 Acknowledge
      const event_runnumber = dayjs(rdoc1Find?.event_date || data?.dataOpenDocument?.event_date).locale('th')

      const input_ref_doc_at = rdoc1Find?.doc_5_input_ref_doc_at || '' //อ้างอิงเอกสารเลขที่
      const input_event_date = (rdoc1Find?.doc_5_input_event_date && `${dayjs(rdoc1Find?.doc_5_input_event_date).locale('th').format('DD')} ${dayjs(rdoc1Find?.doc_5_input_event_date).locale('th').format('MMM')} ${dayjs(rdoc1Find?.doc_5_input_event_date).locale('th').format('BBBB')}`) || '' //ช่วงเวลาของเหตุการณ์ วันที่
      const input_event_time = rdoc1Find?.doc_5_input_event_time || '' //ช่วงเวลาของเหตุการณ์ เวลา
      const input_event_summary = rdoc1Find?.doc_5_input_event_summary || '' //ช่วงเวลาของเหตุการณ์ สรุปการแก้ไขปัญหา
      const input_summary_gas = rdoc1Find?.doc_5_input_summary_gas || '' //สรุปผลกระทบด้านปริมาณก๊าซ และด้านคุณภาพก๊าซ
      const input_more_info = rdoc1Find?.doc_5_input_more_info || '' //ข้อมูลเพิ่มเติม

      const longdo_dict = rdoc1Find?.longdo_dict || '' //สำเนา

      ;(pdfMake as any).vfs = vfs
      const fonts = {
        THSarabun: {
          normal: 'THSarabunNew.ttf',
          bold: 'THSarabunNew-Bold.ttf',
          italics: 'THSarabunNew.ttf',
          bolditalics: 'THSarabunNew-Bold.ttf'
        }
      }
      ;(pdfMake as any).fonts = fonts
      const docDefinition = {
        header: (currentPage:any, pageCount:any) => {
          return {
            columns: [
              {
                width: '*',
                text: ''
              }, // เว้นซ้าย
              {
                width: 'auto',
                stack: [
                  {
                    // text: `เลขที่เอกสาร: …………${event_nember}…………`,
                    text: `เลขที่เอกสาร: …………${document_code_doc5}…………`,
                    fontSize: 12,
                    alignment: 'right'
                  },
                  {
                    text: `วันเดือนปีเอกสาร: ……${event_runnumber.format('DD')}…/……${event_runnumber.format('MMM')}……${event_runnumber.format('BBBB')}…………`,
                    fontSize: 12,
                    alignment: 'right'
                  }
                ],
                margin: [0, 5, 10, 0] // [left, top, right, bottom],
              }
            ]
          }
        },
        content: [
          {
            image: logoImage,
            width: 70,
            alignment: 'center',
            margin: [0, 0, 0, 10]
          },

          {
            text: 'เอกสารแจ้งเหตุการณ์ฉุกเฉิน/เหตุการณ์ความไม่สมดุลอย่างรุนแรง กลับเป็นปกติ 3',
            alignment: 'center',
            fontSize: 18,
            bold: true,
            margin: [0, 0, 0, 5]
          },

          // ======== กรอบ "เรียน / สำเนา" =========
          {
            table: {
              widths: ['auto', '*'],
              body: [
                [
                  {
                    text: 'ส่ง:',
                    bold: true,
                    alignment: 'center',
                    verticalAlignment: 'middle',
                    margin: [0, 10, 0, 10]
                  },
                  {
                    stack: [
                      `${groupName}`
                      // 'โรงไฟฟ้าพลังความร้อนร่วมบางปะกงชุดที่ 1 (BPK-C1)',
                    ],
                    margin: [0, 10, 0, 10] // << บังคับความสูงให้จัดกลาง
                  }
                ],
                [
                  {
                    text: 'สำเนา:',
                    bold: true,
                    alignment: 'center',
                    verticalAlignment: 'middle',
                    margin: [0, 10, 0, 10]
                  },
                  {
                    stack: [`${longdo_dict || ''}`],
                    margin: [0, 10, 0, 10] // << บังคับความสูงให้จัดกลาง
                  }
                ]
              ]
            },
            layout: {
              hLineWidth: () => 0.5,
              vLineWidth: () => 0.5
            },
            margin: [0, 0, 0, 0]
          },

          // ======== กรอบ =========
          {
            table: {
              widths: ['*'],
              body: [
                [
                  {
                    stack: [
                      {
                        text: [
                          {
                            text: `space`,
                            opacity: 0
                          },
                          {
                            text: `อ้างอิงการแจ้งเหตุฉุกเฉิน/เหตุการณ์ความไม่สมดุลอย่างรุนแรง ตามเอกสารเลขที่ `
                          },
                          {
                            text: input_ref_doc_at ? `${input_ref_doc_at}` : '_________',
                            decoration: input_ref_doc_at ? 'underline' : ''
                          },
                          {
                            text: ` หลังจากที่ผู้ ให้บริการระบบส่งก๊าซ (TSO) ได้ดำเนินการ เพื่อควบคุมเหตุการณ์ที่เกิดขึ้นจนกลับสู่สภาวะปกติ`
                          }
                        ],
                        margin: [0, 0, 0, 5],
                        alignment: 'justify'
                      },
                      {
                        text: [
                          // { text: `space`, opacity: 0 },
                          {
                            text: `เมื่อวันที่ `
                          },
                          {
                            text: input_event_date ? `${input_event_date}` : '_________',
                            decoration: input_event_date ? 'underline' : ''
                          },
                          {
                            text: ` เวลา `
                          },
                          {
                            text: input_event_time ? `${input_event_time}` : '_________',
                            decoration: input_event_time ? 'underline' : ''
                          },
                          {
                            text: ` น. จึงขอแจ้งสิ้นสุดคำสั่งต่อผู้ใช้บริการในเอกสารดังกล่าว และให้ผู้ใช้บริการรับ-ส่งก๊าซได้ตามปกติ`
                          }
                        ],
                        margin: [0, 0, 0, 5]
                        // alignment: 'justify',
                      },
                      {
                        text: [
                          // { text: `space`, opacity: 0 },
                          {
                            text: `สรุปการแก้ไขปัญหา: `
                          },
                          {
                            text: input_event_summary ? `${input_event_summary}` : '___________________',
                            decoration: input_event_summary ? 'underline' : ''
                          }
                        ],
                        margin: [0, 0, 0, 5]
                        // alignment: 'justify',
                      }
                    ],
                    margin: [5, 5, 5, 5]
                  }
                ]
              ]
            },
            layout: {
              hLineWidth: () => 0.5,
              vLineWidth: () => 0.5
            },
            margin: [0, 0, 0, 0]
          },

          // ======== กรอบ =========
          {
            table: {
              widths: ['*'],
              body: [
                [
                  {
                    stack: [
                      {
                        text: [
                          {
                            text: `space`,
                            opacity: 0
                          },
                          {
                            text: `สรุปผลกระทบด้านปริมาณ และด้านคุณภาพก๊าซ: `
                          },
                          {
                            text: input_summary_gas ? `${input_summary_gas}` : '___________________',
                            decoration: input_summary_gas ? 'underline' : ''
                          }
                        ],
                        margin: [0, 0, 0, 5]
                        // alignment: 'justify',
                      },
                      {
                        text: [
                          // { text: `space`, opacity: 0 },
                          {
                            text: `ข้อมูลเพิ่มเติม: `
                          },
                          {
                            text: input_more_info ? `${input_more_info}` : '___________________',
                            decoration: input_more_info ? 'underline' : ''
                          }
                        ],
                        margin: [0, 0, 0, 5]
                        // alignment: 'justify',
                      }
                    ],
                    margin: [5, 5, 5, 5]
                  }
                ]
              ]
            },
            layout: {
              hLineWidth: () => 0.5,
              vLineWidth: () => 0.5
            },
            margin: [0, 0, 0, 0]
          },

          // ======== กรอบช่องเซ็นชื่อ =========
          // {
          //   table: {
          //     widths: ['*', '*'],
          //     body: [
          //       [
          //         {
          //           stack: [
          //             { text: `แจ้งโดย ${fromFullname}` },
          //             fromSignature
          //               ? {
          //                   columns: [
          //                     { text: '(', width: 'auto', alignment: 'right' },
          //                     {
          //                       image: fromSignature, // base64 หรือ path
          //                       width: 50,
          //                       alignment: 'center',
          //                     },
          //                     { text: ')', width: 'auto', alignment: 'left' },
          //                   ],
          //                   columnGap: 15, // ระยะห่างระหว่างวงเล็บกับภาพ
          //                   margin: [0, 2, 0, 5], // ปรับระยะรอบภาพ
          //                 }
          //               : { text: `(                                   )` },
          //             { text: `หน่วยงาน ${fromCompany} (ผู้ให้บริการ)` },
          //             {
          //               text: `เวลา : ${fromDate.format('HH:mm')} น. วันที่/เดือน/ปี: ${fromDate.format('DD')} / ${fromDate.format('MM')} / ${fromDate.format('BB')}`,
          //             },
          //           ],
          //           margin: [5, 5, 5, 5],
          //         },
          //         {
          //           stack: [
          //             { text: `รับทราบโดย${toFullname}` },
          //             toSignature
          //               ? {
          //                   columns: [
          //                     { text: '(', width: 'auto', alignment: 'right' },
          //                     {
          //                       image: toSignature, // base64 หรือ path
          //                       width: 50,
          //                       alignment: 'center',
          //                     },
          //                     { text: ')', width: 'auto', alignment: 'left' },
          //                   ],
          //                   columnGap: 5, // ระยะห่างระหว่างวงเล็บกับภาพ
          //                   margin: [0, 2, 0, 5], // ปรับระยะรอบภาพ
          //                 }
          //               : { text: `(                                   )` },
          //             { text: `หน่วยงาน ${toCompany} (ผู้ใช้บริการ)` },
          //             {
          //               text: `เวลา : ${rdoc1Find?.event_doc_status?.id === 2 ? ' ' : toDate.format('HH:mm')} น. วันที่/เดือน/ปี: ${rdoc1Find?.event_doc_status?.id === 2 ? ' ' : toDate.format('DD')} / ${rdoc1Find?.event_doc_status?.id === 2 ? ' ' : toDate.format('MM')} / ${rdoc1Find?.event_doc_status?.id === 2 ? ' ' : toDate.format('BB')}`,
          //             },
          //           ],
          //           margin: [5, 5, 5, 5],
          //         },
          //       ],
          //     ],
          //   },
          //   layout: {
          //     hLineWidth: () => 0.5,
          //     vLineWidth: () => 0.5,
          //   },
          //   margin: [0, 0, 0, 0],
          // },
          {
            table: {
              widths: ['*', '*'],
              body: [
                [
                  {
                    stack: [
                      // { text: `แจ้งโดย ${fromFullname}` },
                      // fromSignature
                      //   ? {
                      //       columns: [
                      //         { text: '(', width: 'auto', alignment: 'right' },
                      //         {
                      //           image: fromSignature, // base64 หรือ path
                      //           width: 50,
                      //           alignment: 'center',
                      //         },
                      //         { text: ')', width: 'auto', alignment: 'left' },
                      //       ],
                      //       columnGap: 15, // ระยะห่างระหว่างวงเล็บกับภาพ
                      //       margin: [0, 2, 0, 5], // ปรับระยะรอบภาพ
                      //     }
                      //   : { text: `(                                   )` },
                      fromSignature
                        ? {
                            columns: [
                              {
                                text: 'แจ้งโดย ',
                                width: 'auto',
                                alignment: 'right'
                              },
                              {
                                image: fromSignature, // base64 หรือ path
                                width: 50,
                                alignment: 'center'
                              }
                            ],
                            columnGap: 15, // ระยะห่างระหว่างวงเล็บกับภาพ
                            margin: [0, 2, 0, 5] // ปรับระยะรอบภาพ
                          }
                        : {
                            text: `แจ้งโดย `
                          },
                      {
                        text: fromFullname ? `( ${fromFullname} )` : `(                                   )`
                      },
                      {
                        text: `หน่วยงาน ${fromCompany} (ผู้ให้บริการ)`
                      },
                      {
                        text: `เวลา : ${fromDate.format('HH:mm')} น. วันที่/เดือน/ปี: ${fromDate.format('DD')} / ${fromDate.format('MM')} / ${fromDate.format('BB')}`
                      }
                    ],
                    margin: [5, 5, 5, 5]
                  },
                  {
                    stack: [
                      // { text: `รับทราบโดย${rdoc1Find?.event_doc_status?.id === 2 ? ' ' : toFullname}` },
                      // rdoc1Find?.event_doc_status?.id === 5 && toSignature
                      event_doc_status === 5 && toSignature
                        ? {
                            columns: [
                              {
                                text: 'รับทราบโดย',
                                width: 'auto',
                                alignment: 'right'
                              },
                              // { text: 'รับทราบโดย', width: 'auto', alignment: 'right' },
                              {
                                image: toSignature, // base64 หรือ path
                                width: 50,
                                alignment: 'center'
                              }
                              // { text: ')', width: 'auto', alignment: 'left' },
                            ],
                            columnGap: 5, // ระยะห่างระหว่างวงเล็บกับภาพ
                            margin: [0, 2, 0, 5] // ปรับระยะรอบภาพ
                          }
                        : {
                            text: `รับทราบโดย`
                          },
                      {
                        text: event_doc_status === 5 ? `(${toFullname})` : '(…………………………………………………………)'
                      },
                      {
                        text: `หน่วยงาน ${event_doc_status === 2 ? '………………………………………………………………' : toCompany}`
                      },
                      {
                        text: `(ผู้ใช้บริการ)`,
                        width: 'auto',
                        alignment: 'center'
                      },
                      {
                        text: `เวลา : ${event_doc_status === 2 ? ' ' : toDate.format('HH:mm')} น. วันที่/เดือน/ปี: ${event_doc_status === 2 ? ' ' : toDate.format('DD')} / ${event_doc_status === 2 ? ' ' : toDate.format('MM')} / ${event_doc_status === 2 ? ' ' : toDate.format('BB')}`
                      }
                    ],
                    margin: [5, 5, 5, 5]
                  }
                ]
              ]
            },
            layout: {
              hLineWidth: () => 0.5,
              vLineWidth: () => 0.5
            },
            margin: [0, 0, 0, 0]
          }

          // ======== Footer ========
          // {
          //   text: 'F–บก.บกคด.–0023 ประกาศใช้ 05/11/2564 เวอร์ชั่น 4',
          //   alignment: 'left',
          //   fontSize: 10,
          //   bold: true,
          //   margin: [0, 10, 0, 0],
          // },
        ],
        defaultStyle: {
          font: 'THSarabun',
          fontSize: 14
          // characterSpacing: -0.5,
        }
      }

    return docDefinition;

}

// DOC.6 done
export function PdfDoc6({ data }: any) {

  const shipperIdArr = Array.from(new Set((data?.data?.[0]?.item?.gas_shipper || [])?.flatMap((fm:any) => fm?.shipper) || []))

  return <UiRedderPDF pdfUrlArr={shipperIdArr.map((e:any, ix:number) => {
    return   {
      ix: ix,
      shipperId: (data?.shipperData || [])?.find((f:any) => f?.id === e)?.id || null,
      shipperName: (data?.shipperData || [])?.find((f:any) => f?.id === e)?.name || null,
      pdfUrl: <PDFMiddleCustom docDefinition={PdfDoc6Used({shipper: (data?.shipperData || [])?.find((f:any) => f?.id === e) || null, data})} />
    }
  })} />;
 
}

const PdfDoc6Used = ({ shipper, data }: any) => {
    // "……"
    // "……………………………………………………"
    const group: any = null;
    const groupId: any = shipper?.id;

    const logoImage = `data:image/png;base64,${logoPtt}`;
    const logoUsed = `data:image/png;base64,${used}`;
    const logoNotUsed = `data:image/png;base64,${notUsed}`;
    const shipperNameArr = shipper?.name || "";
    const document_code_doc6 = `${data?.dataOpenDocument?.event_runnumber_emer?.event_nember || "……"}/${data?.dataOpenDocument?.document_code || "……"}-${shipperNameArr || "……"}`;
    const rdoc1Find: any = {
      ...data?.data?.[0]?.item
    };


      const groupName = shipperNameArr

      const toFullname = "……………………………………………………"
      
      const userType_ = data?.dataOpenDocument?.group?.user_type_id // (userType_ === 3 ? ' Shipper' : "")
      const toCompany = (shipperNameArr + (userType_ === 3 ? ' Shipper' : "")) || ''
      const toDate = dayjs().locale('th')
      const toSignature = '' //

      const fromFullname = "……………………………………………………"
      const fromCompany = 'PTT TSO'
      const fromSignature = '' //

      const fromDate = dayjs().locale('th')

      const event_doc_status = rdoc1Find?.event_doc_status?.id // 3 accept, 4 reject, 5 Acknowledge
      
      const event_runnumber = dayjs(rdoc1Find?.event_date || data?.dataOpenDocument?.event_date).locale('th')

      const input_ref_doc_at = rdoc1Find?.doc_6_input_ref_doc_at || '' //อ้างอิงเอกสารเลขที่
      const input_when_date = (rdoc1Find?.doc_6_input_when_date && `${dayjs(rdoc1Find?.doc_6_input_when_date).locale('th').format('DD')} ${dayjs(rdoc1Find?.doc_6_input_when_date).locale('th').format('MMM')} ${dayjs(rdoc1Find?.doc_6_input_when_date).locale('th').format('BBBB')}`) || '' //ช่วงเวลาของเหตุการณ์ วันที่
      const input_when_time = rdoc1Find?.doc_6_input_when_time || '' //ช่วงเวลาของเหตุการณ์ เวลา
      const input_note = rdoc1Find?.doc_6_input_note || '' //หมายเหตุ

      const longdo_dict = rdoc1Find?.longdo_dict || '' //สำเนา
    
      const gasShipper = (data?.data?.[0]?.item?.gas_shipper || [])?.filter((f:any) => {
        return f?.shipper?.includes(groupId)
      })

      const irShipper = Array.from({length: 5}, (_, i) => i)?.map((ir: any, ix: number) => {
        const datas = gasShipper?.[ix] || null
        return {
          columns: [
            {
              width: 'auto',
              text: `space`,
              opacity: 0
            },
            {
              width: 10,
              text: `${ix + 1}.`
            },
            {
              image: datas?.ir === 1 ? logoUsed : logoNotUsed,
              width: 12,
              height: 12,
              margin: [0, 0, 3, 0]
            },
            {
              width: 'auto',
              text: 'เพิ่ม /'
            },
            {
              image: datas?.ir === 2 ? logoUsed : logoNotUsed,
              width: 12,
              height: 12,
              margin: [0, 0, 3, 0]
            },
            {
              width: 'auto',
              text: 'ลด'
            },
            {
              width: 'auto',
              text: 'ปริมาณก๊าซที่'
            },
            {
              width: 'auto',
              text: data?.dataNomPointForDoc6?.find((f:any) => f?.id === datas?.nom_point)?.nomination_point || '________',
              decoration: data?.dataNomPointForDoc6?.find((f:any) => f?.id === datas?.nom_point)?.nomination_point ? 'underline' : ''
            },
            {
              width: 'auto',
              text: 'คิดเป็นปริมาณ:'
            },
            {
              width: 'auto',
              text: datas?.nom_value_mmscfh ? `${datas?.nom_value_mmscfh} MMSCFH` : '________' + ' MMSCFH',
              decoration: datas?.nom_value_mmscfh ? 'underline' : ''
            }
          ],
          columnGap: 5,
          margin: [0, 0, 0, 5]
        }
      })

      const ir6Shipper =
        gasShipper?.map((ir: any, ix: number) => {
          return {
            columns: [
              {
                width: 'auto',
                text: `space___`,
                opacity: 0
              },
              {
                width: 'auto',
                text: `${ix + 1} ${ir?.gas_command}`,
                decoration: 'underline'
              }
            ],
            columnGap: 5,
            margin: [0, 0, 0, 5]
          }
        }) || []

      const ir6ShipperMore =
        gasShipper?.map((ir: any, ix: number) => {
          return {
            columns: [
              {
                width: 'auto',
                text: `space___`,
                opacity: 0
              },
              {
                width: 'auto',
                text: `${ix + 1} ${ir?.gas_more || '-'}`,
                decoration: 'underline'
              }
            ],
            columnGap: 5,
            margin: [0, 0, 0, 5]
          }
        }) || []

      ;(pdfMake as any).vfs = vfs
      const fonts = {
        THSarabun: {
          normal: 'THSarabunNew.ttf',
          bold: 'THSarabunNew-Bold.ttf',
          italics: 'THSarabunNew.ttf',
          bolditalics: 'THSarabunNew-Bold.ttf'
        }
      }
      ;(pdfMake as any).fonts = fonts
      const docDefinition = {
        header: (currentPage:any, pageCount:any) => {
          return {
            columns: [
              {
                width: '*',
                text: ''
              }, // เว้นซ้าย
              {
                width: 'auto',
                stack: [
                  {
                    // text: `เลขที่เอกสาร: …………${event_nember}…………`,
                    text: `เลขที่เอกสาร: …………${document_code_doc6}…………`,
                    fontSize: 12,
                    alignment: 'right'
                  },
                  {
                    text: `วันเดือนปีเอกสาร: ……${event_runnumber.format('DD')}…/……${event_runnumber.format('MMM')}……${event_runnumber.format('BBBB')}…………`,
                    fontSize: 12,
                    alignment: 'right'
                  }
                ],
                margin: [0, 5, 10, 0] // [left, top, right, bottom],
              }
            ]
          }
        },
        content: [
          {
            image: logoImage,
            width: 70,
            alignment: 'center',
            margin: [0, 0, 0, 10]
          },

          {
            text: 'เอกสารแจ้งสรุปการปรับปริมาณก๊าซ',
            alignment: 'center',
            fontSize: 18,
            bold: true,
            margin: [0, 0, 0, 5]
          },

          // ======== กรอบ "เรียน / สำเนา" =========
          {
            table: {
              widths: ['auto', '*'],
              body: [
                [
                  {
                    text: 'ส่ง:',
                    bold: true,
                    alignment: 'center',
                    verticalAlignment: 'middle',
                    margin: [0, 10, 0, 10]
                  },
                  {
                    stack: [
                      `${groupName}`
                      // 'โรงไฟฟ้าพลังความร้อนร่วมบางปะกงชุดที่ 1 (BPK-C1)',
                    ],
                    margin: [0, 10, 0, 10] // << บังคับความสูงให้จัดกลาง
                  }
                ],
                [
                  {
                    text: 'สำเนา:',
                    bold: true,
                    alignment: 'center',
                    verticalAlignment: 'middle',
                    margin: [0, 10, 0, 10]
                  },
                  {
                    stack: [`${longdo_dict}`],
                    margin: [0, 10, 0, 10] // << บังคับความสูงให้จัดกลาง
                  }
                ]
              ]
            },
            layout: {
              hLineWidth: () => 0.5,
              vLineWidth: () => 0.5
            },
            margin: [0, 0, 0, 0]
          },

          // ======== กรอบ "ส่วนของผู้ให้บริการ" =========
          {
            table: {
              widths: ['*'],
              body: [
                [
                  {
                    stack: [
                      {
                        text: 'ส่วนของผู้ให้บริการ',
                        bold: true,
                        decoration: 'underline',
                        margin: [0, 0, 0, 5]
                      },
                      {
                        text: [
                          {
                            text: `space`,
                            opacity: 0
                          },
                          {
                            text: `เนื่องด้วยเหตุการณ์ฉุกเฉิน/เหตุการณ์ความไม่สมดุลอย่างรุนแรง ในวันที่/เวลา: `
                          },
                          {
                            text: input_when_date ? `${input_when_date}` : '_______________',
                            decoration: input_when_date ? 'underline' : ''
                          },
                          {
                            text: ` เวลา `
                          },
                          {
                            text: input_when_time ? `${input_when_time}` : '_______________',
                            decoration: input_when_time ? 'underline' : ''
                          },
                          {
                            text: ` ซึ่งมีรายละเอียดดังเอกสารเลขที่ `
                          },
                          {
                            text: input_ref_doc_at ? `${input_ref_doc_at}` : '_______________',
                            decoration: input_ref_doc_at ? 'underline' : ''
                          }
                        ],
                        margin: [0, 0, 0, 5],
                        alignment: 'justify'
                      },
                      {
                        text: [
                          {
                            text: `space`,
                            opacity: 0
                          },
                          {
                            text: `ทั้งนี้เพื่อควบคุมสถานการณ์ และรักษาความมั่นคงปลอดภัยของระบบส่งก๊าซ ผู้ให้บริการระบบส่งก๊าซ (TSO) จึงออกคำสั่งต่อผู้ใช้บริการ / คู่สัญญาของผู้ใช้บริการ ดังต่อไปนี้`
                          }
                        ],
                        margin: [0, 0, 0, 5],
                        alignment: 'justify'
                      },
                      ...irShipper,
                      {
                        columns: [
                          {
                            width: 'auto',
                            text: `space`,
                            opacity: 0
                          },
                          {
                            width: 'auto',
                            text: `6. การสั่งการอื่นๆ : `
                          }
                        ],
                        columnGap: 5,
                        margin: [0, 0, 0, 5]
                      },
                      ...ir6Shipper,
                      {
                        text: [
                          {
                            text: `หมายเหตุ: `,
                            bold: true,
                            decoration: 'underline'
                          },
                          {
                            text: ` `
                          },
                          {
                            text: input_note ? `${input_note}` : '_______________',
                            decoration: input_note ? 'underline' : ''
                          }
                        ],
                        margin: [0, 0, 0, 5],
                        alignment: 'justify'
                      },
                      {
                        text: [
                          {
                            text: `ข้อมูลเพิ่มเติม (ถ้ามี) : `,
                            bold: true
                          }
                        ],
                        margin: [0, 0, 0, 5],
                        alignment: 'justify'
                      },
                      ...ir6ShipperMore
                    ],
                    margin: [5, 5, 5, 5]
                  }
                ]
              ]
            },
            layout: {
              hLineWidth: () => 0.5,
              vLineWidth: () => 0.5
            },
            margin: [0, 0, 0, 0]
          },

          {
            table: {
              widths: ['*', '*'],
              body: [
                [
                  {
                    stack: [
                      fromSignature
                        ? {
                            columns: [
                              {
                                text: 'แจ้งโดย',
                                width: 'auto',
                                alignment: 'right'
                              },
                              {
                                image: fromSignature, // base64 หรือ path
                                width: 50,
                                alignment: 'center'
                              }
                            ],
                            columnGap: 15, // ระยะห่างระหว่างวงเล็บกับภาพ
                            margin: [0, 2, 0, 5] // ปรับระยะรอบภาพ
                          }
                        : {
                            columns: [
                              {
                                text: 'แจ้งโดย',
                                width: 'auto',
                                alignment: 'right'
                              },
                            ],
                            columnGap: 15, // ระยะห่างระหว่างวงเล็บกับภาพ
                            margin: [0, 2, 0, 5] // ปรับระยะรอบภาพ
                          },
                      {
                        text: `(${fromFullname})`
                      },
                      {
                        text: `หน่วยงาน ${fromCompany} (ผู้ให้บริการ)`
                      },
                      {
                        text: `เวลา : ${fromDate.format('HH:mm')} น. วันที่/เดือน/ปี: ${fromDate.format('DD')} / ${fromDate.format('MM')} / ${fromDate.format('BB')}`
                      }
                    ],
                    margin: [5, 5, 5, 5]
                  },
                  {
                    stack: [
                      event_doc_status === 5 && toSignature
                        ? {
                            columns: [
                              {
                                text: 'รับทราบโดย',
                                width: 'auto',
                                alignment: 'right'
                              },
                              // { text: 'รับทราบโดย', width: 'auto', alignment: 'right' },
                              {
                                image: toSignature, // base64 หรือ path
                                width: 50,
                                alignment: 'center'
                              }
                              // { text: ')', width: 'auto', alignment: 'left' },
                            ],
                            columnGap: 5, // ระยะห่างระหว่างวงเล็บกับภาพ
                            margin: [0, 2, 0, 5] // ปรับระยะรอบภาพ
                          }
                        : {
                            text: `รับทราบโดย`
                          },
                      {
                        text: event_doc_status === 5 ? `(${toFullname})` : '(…………………………………………………………)'
                      },
                      {
                        text: `หน่วยงาน ${event_doc_status === 2 ? '………………………………………………………………' : toCompany}`
                      },
                      {
                        text: `(ผู้ใช้บริการ/คู่สัญญาของผู้ใช้บริการ/ผู้เกี่ยวข้อง)`,
                        width: 'auto',
                        alignment: 'center'
                      },
                      {
                        text: `เวลา : ${event_doc_status === 2 ? ' ' : toDate.format('HH:mm')} น. วันที่/เดือน/ปี: ${event_doc_status === 2 ? ' ' : toDate.format('DD')} / ${event_doc_status === 2 ? ' ' : toDate.format('MM')} / ${event_doc_status === 2 ? ' ' : toDate.format('BB')}`
                      }
                    ],
                    margin: [5, 5, 5, 5]
                  }
                ]
              ]
            },
            layout: {
              hLineWidth: () => 0.5,
              vLineWidth: () => 0.5
            },
            margin: [0, 0, 0, 0]
          }

          // ======== Footer ========
          // {
          //   text: 'F–บก.บกคด.–0023 ประกาศใช้ 05/11/2564 เวอร์ชั่น 4',
          //   alignment: 'left',
          //   fontSize: 10,
          //   bold: true,
          //   margin: [0, 10, 0, 0],
          // },
        ],
        defaultStyle: {
          font: 'THSarabun',
          fontSize: 14
          // characterSpacing: -0.5,
        }
      }

    return docDefinition;

}

// DOC.8 done
// export function PdfDoc8({ data }: any) {
//   const shipperIdArr = Array.from(new Set((data?.data?.[0]?.item?.shipperArr || [])?.flatMap((fm:any) => fm?.shipper) || []))

//   return <UiRedderPDF pdfUrlArr={shipperIdArr.map((e:any, ix:number) => {
//     return   {
//       ix: ix,
//       shipperId: (data?.shipperData || [])?.find((f:any) => f?.id === e)?.id || null,
//       shipperName: (data?.shipperData || [])?.find((f:any) => f?.id === e)?.name || null,
//       pdfUrl: <PDFMiddleCustom docDefinition={PdfDoc8Used({shipper: (data?.shipperData || [])?.find((f:any) => f?.id === e) || null, data})} />
//     }
//   })} />;
 
// }

export function PdfDoc8({ data }: any) {
  const [pdfUrlArr, setPdfUrlArr] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const shipperIdArr = useMemo(() => {
    return Array.from(
      new Set(
        (data?.data?.[0]?.item?.shipperArr || []).flatMap((fm: any) => fm?.shipper)
      )
    );
  }, [data]);

  useEffect(() => {
    let isMounted = true;

    setLoading(true);

    Promise.all(
      (shipperIdArr || []).map((e: any, ix: number) => {
        const shipper =
          (data?.shipperData || []).find((f: any) => f?.id === e) || null;

        return PdfDoc8Used({
          shipper,
          data,
        }).then((docDefinition: any) => {
          return {
            ix,
            shipperId: shipper?.id || null,
            shipperName: shipper?.name || null,
            pdfUrl: <PDFMiddleCustom docDefinition={docDefinition} />,
          };
        });
      })
    )
      .then((result: any[]) => {
        if (isMounted) {
          setPdfUrlArr(result);
        }
      })
      .catch((err: any) => {
        console.error("Create PDF Doc8 error:", err);

        if (isMounted) {
          setPdfUrlArr([]);
        }
      })
      .finally(() => {
        if (isMounted) {
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [data, shipperIdArr]);

  if (loading) {
    return <div>Loading PDF...</div>;
  }

  return <UiRedderPDF pdfUrlArr={pdfUrlArr} />;
}

const PdfDoc8Used = ({ shipper, data }: any) => {
    // "……"
    // "……………………………………………………"
    const group: any = null;
    const groupId: any = shipper?.id;

    const logoImage = `data:image/png;base64,${logoPtt}`;
    const logoUsed = `data:image/png;base64,${used}`;
    const logoNotUsed = `data:image/png;base64,${notUsed}`;
    const shipperNameArr = shipper?.name || "";
    const document_code_doc8 = `${data?.dataOpenDocument?.event_runnumber_ofo?.event_nember || "……"}/${data?.dataOpenDocument?.document_code || "……"}-${shipperNameArr || "……"}`;
    
    const shipperArr_ = data?.data?.[0]?.item?.shipperArr?.filter((f:any) => f?.shipper?.includes(shipper?.id))
    const usedData = (shipperArr_ || [])?.[shipperArr_?.length - 1]
  
    
    const rdoc1Find: any = {
      ...data?.data?.[0]?.item,
      ...usedData,
    };



      const groupName = shipperNameArr

      const event_document_action = rdoc1Find?.event_document_ofo_action

      const toAction = event_document_action?.find((f: any) => (f?.user_type_id === 3 || f?.user_type_id === 4) && f?.group_id === groupId)
      const toFullname = toAction?.event_doc_status_id !== 1 && toAction?.event_doc_status_id !== 2 && toAction?.create_by_account?.first_name && toAction?.create_by_account?.last_name ? `${toAction?.create_by_account?.first_name} ${toAction?.create_by_account?.last_name}` : ''

      // const toCompany = (toAction?.group?.company_name && toAction?.group?.company_name) || ''
      const userType_ = toAction?.group?.user_type_id // (userType_ === 3 ? ' Shipper' : "")
      const toCompany = (shipperNameArr && shipperNameArr + (userType_ === 3 ? ' Shipper' : "")) || ''
      const toDate = dayjs(toAction?.create_date).locale('th')
      const toSignature = '' //

      // ----
      const fromFullname = "……………………………………………………"
      // const fromCompany = 'บริษัท ปตท.จำกัด (มหาชน)'
      const fromCompany = 'PTT TSO'
      const fromSignature = '' //

      const fromDate = dayjs(rdoc1Find?.create_date).locale('th')

      const event_nember = rdoc1Find?.event_runnumber_ofo?.event_nember
      const event_doc_status = rdoc1Find?.event_doc_status?.id // 3 accept, 4 reject, 5 Acknowledge
      const event_runnumber = dayjs(rdoc1Find?.event_date).locale('th')
      const event_doc_ofo_type_id = rdoc1Find?.event_runnumber_ofo?.event_doc_ofo_type_id //` น. จึงขอแจ้งสิ้นสุดคำสั่งเพิ่ม/ลดปริมาณก๊าซ (${rdoc1Find?.event_runnumber_ofo?.event_doc_ofo_type_id === 1 ? 'Operation Flow Order' : 'Instructed Flow Order'}) ในเอกสารดังกล่าว และให้ผู้ใช้บริการรับ-ส่งก๊าซได้ตามปกติ`
      // `อ้างอิงคำสั่งเพิ่ม/ลดปริมาณก๊าซ (${rdoc1Find?.event_runnumber_ofo?.event_doc_ofo_type_id === 1 ? 'Operation Flow Order' : 'Instructed Flow Order'}) ตามเอกสารเลขที่ `,

    // console.log('groupId : ', groupId);
    // console.log('data : ', data);
    // console.log('shipper : ', shipper);

    // ofo/doc8/findDoc 
    let document_code = ""
    return postService('/master/event/ofo/doc8/findDoc7', {
      groupId: groupId,
      event_runnumber_ofo_id: rdoc1Find?.event_runnumber_ofo?.id
    }).then((result:any) => {
      console.log('result : ', result);
      document_code = result?.document_code
      console.log('document_code : ', document_code);

      const document_code_doc7 = `${data?.dataOpenDocument?.event_runnumber_ofo?.event_nember || ""}/${document_code || ''}-${result?.group?.name || ""}`
        const input_ref_doc_at = document_code_doc7 //อ้างอิงเอกสารเลขที่
        // const input_ref_doc_at = rdoc1Find?.doc_8_input_ref_doc_at //อ้างอิงเอกสารเลขที่
        const input_event_date = rdoc1Find?.doc_8_input_date && `${dayjs(rdoc1Find?.doc_8_input_date).locale('th').format('DD')} ${dayjs(rdoc1Find?.doc_8_input_date).locale('th').format('MMM')} ${dayjs(rdoc1Find?.doc_8_input_date).locale('th').format('BBBB')}` //ช่วงเวลาของเหตุการณ์ วันที่
        const input_event_time = rdoc1Find?.doc_8_input_time //ช่วงเวลาของเหตุการณ์ เวลา
        const input_event_summary = rdoc1Find?.doc_8_input_summary //ช่วงเวลาของเหตุการณ์ สรุปการแก้ไขปัญหา
        const input_summary_gas = rdoc1Find?.doc_8_input_summary_gas //สรุปผลกระทบด้านปริมาณก๊าซ และด้านคุณภาพก๊าซ
        const input_more_info = rdoc1Find?.doc_8_input_more //ข้อมูลเพิ่มเติม
  
        const longdo_dict = rdoc1Find?.longdo_dict || '' //สำเนา
  
        ;(pdfMake as any).vfs = vfs
        const fonts = {
          THSarabun: {
            normal: 'THSarabunNew.ttf',
            bold: 'THSarabunNew-Bold.ttf',
            italics: 'THSarabunNew.ttf',
            bolditalics: 'THSarabunNew-Bold.ttf'
          }
        }
        ;(pdfMake as any).fonts = fonts
        const docDefinition = {
          header: (currentPage:any, pageCount:any) => {
            return {
              columns: [
                {
                  width: '*',
                  text: ''
                }, // เว้นซ้าย
                {
                  width: 'auto',
                  stack: [
                    {
                      // text: `เลขที่เอกสาร: …………${event_nember}…………`,
                      text: `เลขที่เอกสาร: …………${document_code_doc8}…………`,
                      fontSize: 12,
                      alignment: 'right'
                    },
                    {
                      text: `วันเดือนปีเอกสาร: ……${event_runnumber.format('DD')}…/……${event_runnumber.format('MMM')}……${event_runnumber.format('BBBB')}…………`,
                      fontSize: 12,
                      alignment: 'right'
                    }
                  ],
                  margin: [0, 5, 10, 0] // [left, top, right, bottom],
                }
              ]
            }
          },
          content: [
            {
              image: logoImage,
              width: 70,
              alignment: 'center',
              margin: [0, 0, 0, 10]
            },
  
            {
              text: `เอกสารแจ้งสิ้นสุดคำสั่งเพิ่ม/ลดปริมาณก๊าซ (${event_doc_ofo_type_id === 1 ? 'Operation Flow Order' : 'Instructed Flow Order'})`,
              alignment: 'center',
              fontSize: 18,
              bold: true,
              margin: [0, 0, 0, 5]
            },
  
            // ======== กรอบ "เรียน / สำเนา" =========
            {
              table: {
                widths: ['auto', '*'],
                body: [
                  [
                    {
                      text: 'ส่ง:',
                      bold: true,
                      alignment: 'center',
                      verticalAlignment: 'middle',
                      margin: [0, 10, 0, 10]
                    },
                    {
                      stack: [`${groupName || ""}`],
                      margin: [0, 10, 0, 10] // << บังคับความสูงให้จัดกลาง
                    }
                  ],
                  [
                    {
                      text: 'สำเนา:',
                      bold: true,
                      alignment: 'center',
                      verticalAlignment: 'middle',
                      margin: [0, 10, 0, 10]
                    },
                    {
                      stack: [`${longdo_dict || ''}`],
                      margin: [0, 10, 0, 10] // << บังคับความสูงให้จัดกลาง
                    }
                  ]
                ]
              },
              layout: {
                hLineWidth: () => 0.5,
                vLineWidth: () => 0.5
              },
              margin: [0, 0, 0, 0]
            },
  
            // ======== กรอบ =========
            {
              table: {
                widths: ['*'],
                body: [
                  [
                    {
                      stack: [
                        {
                          text: [
                            {
                              text: `space`,
                              opacity: 0
                            },
                            {
                              // text: `อ้างอิงคำสั่งเพิ่ม/ลดปริมาณก๊าซ (${rdoc1Find?.event_runnumber_ofo?.event_doc_ofo_type_id === 1 ? 'Operation Flow Order' : 'Instructed Flow Order'}) ตามเอกสารเลขที่ ${input_ref_doc_at} เพื่อปกป้องหรือระงับความเสียหายหรืออันตรายที่อากเกิดขึ้นกับระบบส่งก๊าซ`,
                              text: [
                                `อ้างอิงคำสั่งเพิ่ม/ลดปริมาณก๊าซ (${event_doc_ofo_type_id === 1 ? 'Operation Flow Order' : 'Instructed Flow Order'}) ตามเอกสารเลขที่ `,
                                {
                                  text: input_ref_doc_at ? input_ref_doc_at : '____________',
                                  decoration: input_ref_doc_at && 'underline'
                                },
                                ` เพื่อปกป้องหรือระงับความเสียหายหรืออันตรายที่อากเกิดขึ้นกับระบบส่งก๊าซ`
                              ]
                            }
                          ],
                            margin: [0, 0, 0, 5],
                            alignment: 'left',
                            // lineHeight: 0.9
                        },
                        {
                          text: [
                            {
                              text: `space`,
                              opacity: 0
                            },
                            {
                              // text: `ปัจจุบันผู้ให้บริการระบบส่งก๊าซ (TSO) สามารถควบคุมเหตุการณ์ที่เกิดขึ้นจนกลับสู่สภาวะปกติ เมื่อวันที่ ${input_event_date} เวลา ${input_event_time} น. จึงขอแจ้งสิ้นสุดคำสั่งเพิ่ม/ลดปริมาณก๊าซ (${rdoc1Find?.event_runnumber_ofo?.event_doc_ofo_type_id === 1 ? 'Operation Flow Order' : 'Instructed Flow Order'}) ในเอกสารดังกล่าว และให้ผู้ใช้บริการรับ-ส่งก๊าซได้ตามปกติ`,
                              text: [
                                `ปัจจุบันผู้ให้บริการระบบส่งก๊าซ (TSO) สามารถควบคุมเหตุการณ์ที่เกิดขึ้นจนกลับสู่สภาวะปกติ เมื่อวันที่ `,
                                {
                                  text: input_event_date ? input_event_date : '____________',
                                  decoration: input_event_date && 'underline'
                                },
                                ` เวลา `,
                                {
                                  text: input_event_time ? input_event_time : '____________',
                                  decoration: input_event_time && 'underline'
                                },
                                ` น. จึงขอแจ้งสิ้นสุดคำสั่งเพิ่ม/ลดปริมาณก๊าซ (${event_doc_ofo_type_id === 1 ? 'Operation Flow Order' : 'Instructed Flow Order'}) ในเอกสารดังกล่าว และให้ผู้ใช้บริการรับ-ส่งก๊าซได้ตามปกติ`
                              ]
                            }
                          ],
                          margin: [0, 0, 0, 5],
                          alignment: 'left'
                        },
                        {
                          text: [
                            // { text: `space`, opacity: 0 },
                            {
                              // text: `สรุปการแก้ไขปัญหา: ${input_event_summary}`,
                              text: [
                                `สรุปการแก้ไขปัญหา `,
                                {
                                  text: input_event_summary ? input_event_summary : '____________',
                                  decoration: input_event_summary && 'underline'
                                }
                              ]
                            }
                          ],
                          margin: [0, 0, 0, 5],
                          alignment: 'justify'
                        },
                        {
                          text: [
                            // { text: `space`, opacity: 0 },
                            {
                              // text: `สรุปผลกระทบด้านปริมาณ และด้านคุณภาพก๊าซ: ${input_summary_gas}`,
                              text: [
                                `สรุปผลกระทบด้านปริมาณ และด้านคุณภาพก๊าซ: `,
                                {
                                  text: input_summary_gas ? input_summary_gas : '____________',
                                  decoration: input_summary_gas && 'underline'
                                }
                              ]
                            }
                          ],
                          margin: [0, 0, 0, 5],
                          alignment: 'justify'
                        },
                        {
                          text: [
                            // { text: `space`, opacity: 0 },
                            {
                              // text: `ข้อมูลเพิ่มเติม: ${input_more_info}`,
                              text: [
                                `ข้อมูลเพิ่มเติม: `,
                                {
                                  text: input_more_info ? input_more_info : '____________',
                                  decoration: input_more_info && 'underline'
                                }
                              ]
                            }
                          ],
                          margin: [0, 0, 0, 5],
                          alignment: 'justify'
                        }
                      ],
                      margin: [5, 5, 5, 5]
                    }
                  ]
                ]
              },
              layout: {
                hLineWidth: () => 0.5,
                vLineWidth: () => 0.5
              },
              margin: [0, 0, 0, 0]
            },
  
            // ======== กรอบช่องเซ็นชื่อ =========
            {
              table: {
                widths: ['*', '*'],
                body: [
                  [
                    {
                      stack: [
                        // https://app.clickup.com/t/86eugkjfb
                        fromSignature
                          ? {
                              columns: [
                                {
                                  text: 'แจ้งโดย ',
                                  width: 'auto',
                                  alignment: 'right'
                                },
                                {
                                  image: fromSignature, // base64 หรือ path
                                  width: 50,
                                  alignment: 'center'
                                },
                                {
                                  text: '',
                                  width: 'auto',
                                  alignment: 'left'
                                }
                              ],
                              columnGap: 15, // ระยะห่างระหว่างวงเล็บกับภาพ
                              margin: [0, 2, 0, 5] // ปรับระยะรอบภาพ
                            }
                          : {
                              text: `แจ้งโดย `
                            },
                        {
                          text: fromFullname ? `( ${fromFullname} )` : `(                                   )`
                        },
  
                        // { text: `แจ้งโดย ${fromFullname}` },
                        // fromSignature
                        //   ? {
                        //       columns: [
                        //         {
                        //           text: '(',
                        //           width: 'auto',
                        //           alignment: 'right',
                        //         },
                        //         {
                        //           image: fromSignature, // base64 หรือ path
                        //           width: 50,
                        //           alignment: 'center',
                        //         },
                        //         { text: ')', width: 'auto', alignment: 'left' },
                        //       ],
                        //       columnGap: 15, // ระยะห่างระหว่างวงเล็บกับภาพ
                        //       margin: [0, 2, 0, 5], // ปรับระยะรอบภาพ
                        //     }
                        //   : { text: `(                                   )` },
                        {
                          text: `หน่วยงาน ${fromCompany} (ผู้ให้บริการ)`
                        },
                        {
                          text: `เวลา : ${fromDate.format('HH:mm')} น. วันที่/เดือน/ปี: ${fromDate.format('DD')} / ${fromDate.format('MM')} / ${fromDate.format('BB')}`
                        }
                      ],
                      margin: [5, 5, 5, 5]
                    },
                    {
                      stack: [
                        toSignature && toFullname
                          ? {
                              columns: [
                                {
                                  text: 'รับทราบโดย',
                                  width: 'auto',
                                  alignment: 'right'
                                },
                                {
                                  image: toSignature, // base64 หรือ path
                                  width: 50,
                                  alignment: 'center'
                                },
                                {
                                  text: '',
                                  width: 'auto',
                                  alignment: 'left'
                                }
                              ],
                              columnGap: 5, // ระยะห่างระหว่างวงเล็บกับภาพ
                              margin: [0, 2, 0, 5] // ปรับระยะรอบภาพ
                            }
                          : {
                              text: `รับทราบโดย`
                            },
                        {
                          text: toFullname ? `( ${toFullname} )` : `(                                   )`
                        },
  
                        // { text: `รับทราบโดย${toFullname}` },
                        // toSignature && toFullname
                        //   ? {
                        //       columns: [
                        //         { text: '(', width: 'auto', alignment: 'right' },
                        //         {
                        //           image: toSignature, // base64 หรือ path
                        //           width: 50,
                        //           alignment: 'center',
                        //         },
                        //         { text: ')', width: 'auto', alignment: 'left' },
                        //       ],
                        //       columnGap: 5, // ระยะห่างระหว่างวงเล็บกับภาพ
                        //       margin: [0, 2, 0, 5], // ปรับระยะรอบภาพ
                        //     }
                        //   : { text: `(                                   )` },
                        {
                          text: `หน่วยงาน ${(toCompany) || '________________'} (ผู้ใช้บริการ/คู่สัญญาของผู้ใช้บริการ)`
                        },
                        {
                          text: `เวลา : ${(toFullname && toDate.format('HH:mm')) || '___'} น. วันที่/เดือน/ปี: ${(toFullname && toDate.format('DD')) || '___'} / ${(toFullname && toDate.format('MM')) || '___'} / ${(toFullname && toDate.format('BB')) || '___'}`
                        }
                      ],
                      margin: [5, 5, 5, 5]
                    }
                  ]
                ]
              },
              layout: {
                hLineWidth: () => 0.5,
                vLineWidth: () => 0.5
              },
              margin: [0, 0, 0, 0]
            }
  
            // ======== Footer ========
            // {
            //   text: 'F–บก.บกคด.–0023 ประกาศใช้ 05/11/2564 เวอร์ชั่น 4',
            //   alignment: 'left',
            //   fontSize: 10,
            //   bold: true,
            //   margin: [0, 10, 0, 0],
            // },
          ],
          defaultStyle: {
            font: 'THSarabun',
            fontSize: 14
            // characterSpacing: -0.5,
          }
        }
  
      return docDefinition;
    })

}

// DOC.4 done
export function PdfDoc4({ data }: any) {
  const shipperIdArr = Array.from(new Set((data?.data?.[0]?.item?.gas_shipper_41 || [])?.flatMap((fm:any) => fm?.shipper) || []))

  return <UiRedderPDF pdfUrlArr={shipperIdArr.map((e:any, ix:number) => {
    return   {
      ix: ix,
      shipperId: (data?.shipperData || [])?.find((f:any) => f?.id === e)?.id || null,
      shipperName: (data?.shipperData || [])?.find((f:any) => f?.id === e)?.name || null,
      pdfUrl: <PDFMiddleCustom docDefinition={PdfDoc4Used({shipper: (data?.shipperData || [])?.find((f:any) => f?.id === e) || null, data})} />
    }
  })} />;
 
}

const PdfDoc4Used = ({ shipper, data }: any) => {
    // "……"
    // "……………………………………………………"
    const group: any = null;
    const groupId: any = shipper?.id;

    const logoImage = `data:image/png;base64,${logoPtt}`;
    const logoUsed = `data:image/png;base64,${used}`;
    const logoNotUsed = `data:image/png;base64,${notUsed}`;
    const shipperNameArr = shipper?.name || "";
    const document_code_doc41 = `${data?.dataOpenDocument?.event_runnumber_emer?.event_nember || "……"}/${data?.dataOpenDocument?.document_code || "……"}-${shipperNameArr || "……"}`;
    const rdoc1Find: any = {
      ...data?.data?.[0]?.item
    };

    // const gasShipper = (data?.data?.[0]?.item?.gas_shipper || [])?.filter((f:any) => {
    //     return f?.shipper?.includes(groupId)
    //   })


      const groupName = shipperNameArr

      const event_document_action = rdoc1Find?.event_document_emer_action

      const toAction = event_document_action?.find((f: any) => (f?.user_type_id === 3 || f?.user_type_id === 4) && f?.group_id === groupId)
      const toFullname = "……………………………………………………"

      // const toCompany = (toAction?.group?.company_name && toAction?.group?.company_name) || ''
      const userType_ = toAction?.group?.user_type_id // (userType_ === 3 ? ' Shipper' : "")
      const toCompany = (shipperNameArr + (userType_ === 3 ? ' Shipper' : "")) || ''
      const toDate = dayjs(toAction?.create_date).locale('th')
      const toSignature = '' //

      // ----
      const fromFullname = "……………………………………………………"
      // const fromCompany = 'บริษัท ปตท.จำกัด (มหาชน)'
      const fromCompany = 'PTT TSO'
      const fromSignature = '' //

      const fromDate = dayjs(rdoc1Find?.create_date).locale('th')

      const event_nember = rdoc1Find?.event_nember
      const event_doc_status = rdoc1Find?.event_doc_status?.id || rdoc1Find?.event_doc_status_id // 3 accept, 4 reject, 5 Acknowledge
      const event_runnumber = dayjs(rdoc1Find?.event_date).locale('th')
      const event_doc_emer_type_id = rdoc1Find?.event_doc_emer_type_id

      const event_doc_ofo_gas_tranmiss_other = rdoc1Find?.event_doc_emer_gas_tranmiss_other || '___________'
      const event_doc_emer_gas_tranmiss_id = rdoc1Find?.event_doc_emer_gas_tranmiss_id

      const input_date_time_of_the_incident = rdoc1Find?.doc_41_input_date_time_of_the_incident || '' //วัน/เวลาที่เกิดเหตุ
      const input_incident = rdoc1Find?.doc_41_input_incident || '' //รายละเอียดของเหตุการณ์
      const input_detail_incident = rdoc1Find?.doc_41_input_detail_incident || '' //รายละเอียดของเหตุการณ์
      const input_expected_day_time = rdoc1Find?.doc_41_input_expected_day_time || '' //รายละเอียดของเหตุการณ์

      const longdo_dict = rdoc1Find?.longdo_dict || '' //สำเนา

      const gasShipper_ = (data?.data?.[0]?.item?.gas_shipper_41 || [])?.filter((f:any) => {
          return f?.shipper?.includes(groupId)
        })
      const usedDaata:any = gasShipper_?.length > 0 ? gasShipper_?.[0] : null

      const input_order_ir_id = usedDaata?.ir || null
      const input_order_io_id = usedDaata?.io || null
      const input_order_iother_id = usedDaata?.iother || null
      const input_value = usedDaata?.value || null
      const input_more = usedDaata?.more || null

      const input_shipper_operation = rdoc1Find?.doc_41_input_shipper_operation || null
      const input_shipper_note = rdoc1Find?.doc_41_input_shipper_note || null
      const input_note = rdoc1Find?.doc_41_input_note || null

      ;(pdfMake as any).vfs = vfs
      const fonts = {
        THSarabun: {
          normal: 'THSarabunNew.ttf',
          bold: 'THSarabunNew-Bold.ttf',
          italics: 'THSarabunNew.ttf',
          bolditalics: 'THSarabunNew-Bold.ttf'
        }
      }
      ;(pdfMake as any).fonts = fonts
      const docDefinition = {
        header: (currentPage:any, pageCount:any) => {
          return {
            columns: [
              {
                width: '*',
                text: ''
              }, // เว้นซ้าย
              {
                width: 'auto',
                stack: [
                  {
                    // text: `เลขที่เอกสาร: …………${event_nember}…………`,
                    text: `เลขที่เอกสาร: …………${document_code_doc41}…………`,
                    fontSize: 12,
                    alignment: 'right'
                  },
                  {
                    text: `วันเดือนปีเอกสาร: ……${event_runnumber.format('DD')}…/……${event_runnumber.format('MMM')}……${event_runnumber.format('BBBB')}…………`,
                    fontSize: 12,
                    alignment: 'right'
                  }
                ],
                margin: [0, 5, 10, 0] // [left, top, right, bottom],
              }
            ]
          }
        },
        content: [
          {
            image: logoImage,
            width: 70,
            alignment: 'center',
            margin: [0, 0, 0, 10]
          },

          {
            text: 'เอกสารแจ้งเหตุการณ์ฉุกเฉิน/เหตุการณ์ความไม่สมดุลอย่างรุนแรง 2',
            alignment: 'center',
            fontSize: 18,
            bold: true,
            margin: [0, 0, 0, 5]
          },

          {
            text: '(เอกสารด่วน)',
            alignment: 'center',
            fontSize: 18,
            bold: true,
            margin: [0, 0, 0, 5],
            color: 'red' // หรือใช้โค้ด HEX เช่น '#'
          },

          {
            columns: [
              {
                width: 15,
                image: event_doc_emer_type_id === 1 ? logoUsed : logoNotUsed, // แทนด้วย base64 string //event_doc_status
                verticalAlignment: 'middle',
                alignment: 'center',
                fit: [12, 12]
              },
              {
                text: [
                  {
                    text: 'เหตุการณ์ไม่สมดุลอย่างรุนแรง (Difficult Day) ',
                    bold: true,
                    fontSize: 18
                  }
                ],
                margin: [5, 0, 0, 0], // เว้นระยะจากรูป
                alignment: 'left'
              },
              {
                width: 15,
                image: event_doc_emer_type_id === 2 ? logoUsed : logoNotUsed, // แทนด้วย base64 string //event_doc_status
                verticalAlignment: 'middle',
                alignment: 'center',
                fit: [12, 12]
              },
              {
                text: [
                  {
                    text: 'ภาวะฉุกเฉิน (Emergency) ',
                    bold: true,
                    fontSize: 18
                  }
                ],
                margin: [5, 0, 0, 0], // เว้นระยะจากรูป
                alignment: 'left'
              }
            ],
            margin: [0, 0, 0, 2]
          },

          // ======== กรอบ "เรียน / สำเนา" =========
          {
            table: {
              widths: ['auto', '*'],
              body: [
                [
                  {
                    text: 'ส่ง:',
                    bold: true,
                    alignment: 'center',
                    verticalAlignment: 'middle',
                    margin: [0, 10, 0, 10]
                  },
                  {
                    stack: [
                      // 'ส่วนปฏิบัติกํารรับจ่ํายก๊ําซธรรมชําติรํายวัน (Intra-day Natural Gas Operations Division)',
                      `${groupName}`
                    ],
                    margin: [0, 10, 0, 10] // << บังคับความสูงให้จัดกลาง
                  }
                ],
                [
                  {
                    text: 'สำเนา:',
                    bold: true,
                    alignment: 'center',
                    verticalAlignment: 'middle',
                    margin: [0, 10, 0, 10]
                  },
                  {
                    stack: [
                      `${longdo_dict || ''}`
                      //
                    ],
                    margin: [0, 10, 0, 10] // << บังคับความสูงให้จัดกลาง
                  }
                ]
              ]
            },
            layout: {
              hLineWidth: () => 0.5,
              vLineWidth: () => 0.5
            },
            margin: [0, 0, 0, 0]
          },

          // ======== กรอบ "ระบบส่งก๊าซ" =========
          {
            table: {
              widths: ['*'],
              body: [
                [
                  {
                    stack: [
                      {
                        text: '(1.) ระบบส่งก๊าซ',
                        bold: true,
                        // decoration: 'underline',
                        margin: [0, 0, 0, 5]
                      },
                      {
                        columns: [
                          // { width: 'auto', text: `space`, opacity: 0 },
                          {
                            image: event_doc_emer_gas_tranmiss_id === 1 ? logoUsed : logoNotUsed,
                            width: 12,
                            height: 12,
                            margin: [0, 0, 3, 0]
                          },
                          {
                            width: 'auto',
                            text: 'Onshore East'
                          },
                          {
                            image: event_doc_emer_gas_tranmiss_id === 2 ? logoUsed : logoNotUsed,
                            width: 12,
                            height: 12,
                            margin: [0, 0, 3, 0]
                          },
                          {
                            width: 'auto',
                            text: 'Onshore West'
                          },
                          {
                            image: event_doc_emer_gas_tranmiss_id === 3 ? logoUsed : logoNotUsed,
                            width: 12,
                            height: 12,
                            margin: [0, 0, 3, 0]
                          },
                          {
                            width: 'auto',
                            text: 'Onshore East - West'
                          },
                          {
                            image: event_doc_emer_gas_tranmiss_id === 4 ? logoUsed : logoNotUsed,
                            width: 12,
                            height: 12,
                            margin: [0, 0, 3, 0]
                          },
                          {
                            width: 'auto',
                            text: 'Other:'
                          },
                          {
                            width: 'auto',
                            text: `${event_doc_ofo_gas_tranmiss_other}`
                          }
                        ],
                        columnGap: 5,
                        margin: [0, 0, 0, 5]
                      }
                    ],
                    margin: [5, 5, 5, 5]
                  }
                ]
              ]
            },
            layout: {
              hLineWidth: () => 0.5,
              vLineWidth: () => 0.5
            },
            margin: [0, 0, 0, 0]
          },

          // ======== กรอบ =========
          {
            table: {
              widths: ['*'],
              body: [
                [
                  {
                    stack: [
                      {
                        columns: [
                          {
                            text: 'ส่วนของผู้ให้บริการ',
                            bold: true,
                            decoration: 'underline',
                            margin: [0, 0, 0, 5]
                          }
                        ],
                        columnGap: 5,
                        margin: [0, 0, 0, 5]
                      },
                      {
                        text: [
                          {
                            text: `space`,
                            opacity: 0
                          },
                          {
                            text: `เนื่องด้วยในวันที่/เวลา: `
                          },
                          {
                            text: (input_date_time_of_the_incident && `${input_date_time_of_the_incident}`) || '________',
                            decoration: input_date_time_of_the_incident && 'underline'
                          },
                          {
                            text: ` เกิดเหตุการไม่สมดุลอย่างรุนแรง / ภาวะฉุกเฉิน ซึ่งมีรายละเอียดดังนี้`
                          }
                        ],
                        margin: [0, 0, 0, 5],
                        alignment: 'justify'
                      },
                      {
                        text: [
                          // { text: `space`, opacity: 0 },
                          {
                            text: `สถานที่เกิดเหตุ: `
                          },
                          {
                            text: (input_incident && `${input_incident}`) || '________',
                            decoration: input_incident && 'underline'
                          }
                        ],
                        margin: [0, 0, 0, 5],
                        alignment: 'justify'
                      },
                      {
                        text: [
                          // { text: `space`, opacity: 0 },
                          {
                            text: `รายละเอียดของเหตุการณ์: `
                          },
                          {
                            text: (input_detail_incident && `${input_detail_incident}`) || '________',
                            decoration: input_detail_incident && 'underline'
                          }
                        ],
                        margin: [0, 0, 0, 5],
                        alignment: 'justify'
                      },
                      {
                        columns: [
                          {
                            text: '_______________________________________________________',
                            margin: [0, 0, 0, 5]
                          }
                        ],
                        columnGap: 5,
                        margin: [0, 0, 0, 5]
                      },
                      {
                        text: [
                          // { text: `space`, opacity: 0 },
                          {
                            text: `คาดว่าจะแก้ไขปัญหาแล้วเสร็จในวันที่/เวลา: `,
                            bold: true,
                            decoration: 'underline'
                          },
                          {
                            text: (input_expected_day_time && `${input_expected_day_time}`) || '________',
                            decoration: input_expected_day_time && 'underline'
                          }
                        ],
                        margin: [0, 0, 0, 5],
                        alignment: 'justify'
                      },
                      {
                        columns: [
                          {
                            text: 'ผู้ให้บริการ ดังนี้',
                            // bold: true,
                            // decoration: 'underline',
                            margin: [0, 0, 0, 5]
                          }
                        ],
                        columnGap: 5,
                        margin: [0, 0, 0, 5]
                      },
                      {
                        //..........
                        columns: [
                          // { width: 'auto', text: `space`, opacity: 0 },
                          // { width: 10, text: `${ix + 1}.` },
                          {
                            text: 'การสั่งการ: - ',
                            width: 'auto',
                            bold: true,
                            decoration: 'underline'
                          },
                          {
                            image: input_order_ir_id === 1 ? logoUsed : logoNotUsed,
                            width: 12,
                            height: 12,
                            margin: [0, 0, 3, 0]
                          },
                          {
                            width: 'auto',
                            text: 'เพิ่ม /'
                          },
                          {
                            image: input_order_ir_id === 2 ? logoUsed : logoNotUsed,
                            width: 12,
                            height: 12,
                            margin: [0, 0, 3, 0]
                          },
                          {
                            width: 'auto',
                            text: 'ลด ปริมาณก๊าซที่'
                          },
                          {
                            image: input_order_io_id === 3 ? logoUsed : logoNotUsed,
                            width: 12,
                            height: 12,
                            margin: [0, 0, 3, 0]
                          },
                          {
                            width: 'auto',
                            text: 'จุดส่งเข้า/'
                          },
                          {
                            image: input_order_io_id === 4 ? logoUsed : logoNotUsed,
                            width: 12,
                            height: 12,
                            margin: [0, 0, 3, 0]
                          },
                          {
                            width: 'auto',
                            text: 'จุดจ่ายออก'
                          }
                          // { width: 'auto', text: 'จุดจ่ายออก /' },

                          // { width: 'auto', text: 'ปริมาณ: ' },
                          // {
                          //   width: 'auto',
                          //   text: `${input_value || '________'}`,
                          // },
                        ],
                        columnGap: 5,
                        margin: [0, 0, 0, 5]
                      },
                      {
                        // ปริมาณก๊าซที่
                        columns: [
                          // { width: 'auto', text: `space`, opacity: 0 },
                          // { width: 10, text: `${ix + 1}.` },
                          // {
                          //   text: 'การสั่งการ: - ',
                          //   width: 'auto',
                          //   opacity: 0,
                          //   bold: true,
                          //   decoration: 'underline',
                          // },
                          // {
                          //   image:
                          //     input_order_iother_id === 5
                          //       ? logoUsed
                          //       : logoNotUsed,
                          //   width: 12,
                          //   height: 12,
                          //   margin: [0, 0, 3, 0],
                          // },
                          {
                            width: 'auto',
                            text: `ปริมาณ: `,
                            bold: true,
                            decoration: 'underline'
                          },
                          {
                            width: 'auto',
                            text: (input_value && `${input_value}`) || '________',
                            decoration: input_value && 'underline'
                          }
                        ],
                        columnGap: 5,
                        margin: [0, 0, 0, 5]
                      },
                      {
                        // ปริมาณก๊าซที่
                        columns: [
                          // { width: 'auto', text: `space`, opacity: 0 },
                          // { width: 10, text: `${ix + 1}.` },
                          // {
                          //   text: 'การสั่งการ: - ',
                          //   width: 'auto',
                          //   opacity: 0,
                          //   bold: true,
                          //   decoration: 'underline',
                          // },
                          // {
                          //   image:
                          //     input_order_iother_id === 5
                          //       ? logoUsed
                          //       : logoNotUsed,
                          //   width: 12,
                          //   height: 12,
                          //   margin: [0, 0, 3, 0],
                          // },
                          {
                            width: 'auto',
                            text: `เพิ่มเติม: `,
                            bold: true,
                            decoration: 'underline'
                          },
                          {
                            width: 'auto',
                            text: (input_more && `${input_more}`) || '________',
                            decoration: input_more && 'underline'
                          }
                        ],
                        columnGap: 5,
                        margin: [0, 0, 0, 5]
                      },

                      {
                        columns: [
                          // { width: 'auto', text: `space`, opacity: 0 },
                          {
                            width: 'auto',
                            text: `หมายเหตุ:`,
                            bold: true,
                            decoration: 'underline'
                          },
                          {
                            width: 'auto',
                            text: `${input_note}`,
                            decoration: 'underline'
                          }
                        ],
                        columnGap: 5,
                        margin: [0, 0, 0, 5]
                      }
                    ],
                    margin: [5, 5, 5, 5]
                  }
                ]
              ]
            },
            layout: {
              hLineWidth: () => 0.5,
              vLineWidth: () => 0.5
            },
            margin: [0, 0, 0, 0]
          },

          // ======== กรอบ =========
          {
            table: {
              widths: ['*'],
              body: [
                [
                  {
                    stack: [
                      {
                        columns: [
                          {
                            text: 'ส่วนของผู้ใช้บริการ / คู่สัญญา',
                            bold: true,
                            decoration: 'underline',
                            margin: [0, 0, 0, 5]
                          }
                        ],
                        columnGap: 5,
                        margin: [0, 0, 0, 5]
                      },
                      {
                        columns: [
                          // { width: 'auto', text: `space`, opacity: 0 },
                          {
                            width: 'auto',
                            text: `การดำเนินการ:`
                          },
                          {
                            width: 'auto',
                            text: input_shipper_operation ? `${input_shipper_operation}` : `__________`,
                            decoration: input_shipper_operation && 'underline'
                          }
                        ],
                        columnGap: 5,
                        margin: [0, 0, 0, 5]
                      },
                      {
                        columns: [
                          // { width: 'auto', text: `space`, opacity: 0 },
                          {
                            width: 'auto',
                            text: `หมายเหตุ:`
                          },
                          {
                            width: 'auto',
                            text: input_shipper_note ? `${input_shipper_note}` : `__________`,
                            decoration: input_shipper_note && 'underline'
                          }
                        ],
                        columnGap: 5,
                        margin: [0, 0, 0, 5]
                      }
                    ],
                    margin: [5, 5, 5, 5]
                  }
                ]
              ]
            },
            layout: {
              hLineWidth: () => 0.5,
              vLineWidth: () => 0.5
            },
            margin: [0, 0, 0, 0]
          },

          // ======== กรอบช่องเซ็นชื่อ =========
          {
            table: {
              widths: ['*', '*'],
              body: [
                [
                  // {
                  //     text: 'ส่วนของผู้ใช้บริการ (ผู้ทำให้เกิดเหตุการณ์)',
                  //     bold: true,
                  //     decoration: 'underline',
                  //     margin: [0, 0, 0, 5],
                  //   },
                  {
                    stack: [
                      // { text: `แจ้งโดย ${fromFullname}` },
                      // fromSignature
                      //   ? {
                      //       columns: [
                      //         { text: '(', width: 'auto', alignment: 'right' },
                      //         {
                      //           image: fromSignature, // base64 หรือ path
                      //           width: 50,
                      //           alignment: 'center',
                      //         },
                      //         { text: ')', width: 'auto', alignment: 'left' },
                      //       ],
                      //       columnGap: 15, // ระยะห่างระหว่างวงเล็บกับภาพ
                      //       margin: [0, 2, 0, 5], // ปรับระยะรอบภาพ
                      //     }
                      //   : { text: `(                                   )` },
                      fromSignature
                        ? {
                            columns: [
                              {
                                text: 'แจ้งโดย',
                                width: 'auto',
                                alignment: 'right'
                              },
                              {
                                image: fromSignature, // base64 หรือ path
                                width: 50,
                                alignment: 'center'
                              }
                            ],
                            columnGap: 15, // ระยะห่างระหว่างวงเล็บกับภาพ
                            margin: [0, 2, 0, 5] // ปรับระยะรอบภาพ
                          }
                        : {
                            text: `แจ้งโดย `
                          },
                      {
                        text: `(${fromFullname})`
                      },
                      {
                        text: `หน่วยงาน ${fromCompany} (ผู้ให้บริการ)`
                      },
                      {
                        text: `เวลา : ${fromDate.format('HH:mm')} น. วันที่/เดือน/ปี: ${fromDate.format('DD')} / ${fromDate.format('MM')} / ${fromDate.format('BB')}`
                      }
                    ],
                    margin: [5, 5, 5, 5]
                  },
                  {
                    stack: [
                      // { text: `รับทราบโดย${rdoc1Find?.event_doc_status?.id === 2 ? ' ' : toFullname}` },
                      // rdoc1Find?.event_doc_status?.id === 5 && toSignature
                      event_doc_status === 5 && toSignature
                        ? {
                            columns: [
                              {
                                text: 'รับทราบโดย',
                                width: 'auto',
                                alignment: 'right'
                              },
                              // { text: 'รับทราบโดย', width: 'auto', alignment: 'right' },
                              {
                                image: toSignature, // base64 หรือ path
                                width: 50,
                                alignment: 'center'
                              }
                              // { text: ')', width: 'auto', alignment: 'left' },
                            ],
                            columnGap: 5, // ระยะห่างระหว่างวงเล็บกับภาพ
                            margin: [0, 2, 0, 5] // ปรับระยะรอบภาพ
                          }
                        : {
                            text: `รับทราบโดย`
                          },
                      {
                        text: event_doc_status === 5 ? `(${toFullname})` : '(…………………………………………………………)'
                      },
                      {
                        text: `หน่วยงาน ${event_doc_status === 2 ? '………………………………………………………………' : toCompany}`
                      },
                      {
                        text: `(ผู้ใช้บริการ/คู่สัญญาของผู้ใช้บริการ/ผู้เกี่ยวข้อง)`,
                        width: 'auto',
                        alignment: 'center'
                      },
                      {
                        text: `เวลา : ${event_doc_status === 2 ? ' ' : toDate.format('HH:mm')} น. วันที่/เดือน/ปี: ${event_doc_status === 2 ? ' ' : toDate.format('DD')} / ${event_doc_status === 2 ? ' ' : toDate.format('MM')} / ${event_doc_status === 2 ? ' ' : toDate.format('BB')}`
                      }
                    ],
                    margin: [5, 5, 5, 5]
                  }
                ]
              ]
            },
            layout: {
              hLineWidth: () => 0.5,
              vLineWidth: () => 0.5
            },
            margin: [0, 0, 0, 0]
          }

          // ======== Footer ========
          // {
          //   text: 'F–บก.บกคด.–0023 ประกาศใช้ 05/11/2564 เวอร์ชั่น 4',
          //   alignment: 'left',
          //   fontSize: 10,
          //   bold: true,
          //   margin: [0, 10, 0, 0],
          // },
        ],
        defaultStyle: {
          font: 'THSarabun',
          fontSize: 14
          // characterSpacing: -0.5,
        }
      }

    return docDefinition;

}

// DOC.7 wait
export function PdfDoc7({ data }: any) {
  console.log('data : ', data);
  const shipperIdArr = Array.from(new Set((data?.data?.[0]?.item?.gas_shipper || [])?.flatMap((fm:any) => fm?.shipper) || []))

  return <UiRedderPDF pdfUrlArr={shipperIdArr.map((e:any, ix:number) => {
    return   {
      ix: ix,
      shipperId: (data?.shipperData || [])?.find((f:any) => f?.id === e)?.id || null,
      shipperName: (data?.shipperData || [])?.find((f:any) => f?.id === e)?.name || null,
      pdfUrl: <PDFMiddleCustom docDefinition={PdfDoc7Used({shipper: (data?.shipperData || [])?.find((f:any) => f?.id === e) || null, data})} />
    }
  })} />;
 
}

const PdfDoc7Used = ({ shipper, data }: any) => {
    // "……"
    // "……………………………………………………"
    const group: any = null;
    const groupId: any = shipper?.id;

    const logoImage = `data:image/png;base64,${logoPtt}`;
    const logoUsed = `data:image/png;base64,${used}`;
    const logoNotUsed = `data:image/png;base64,${notUsed}`;

    const logocheckBoxCheck = `data:image/png;base64,${checkBoxCheck}`
    const logocheckBox = `data:image/png;base64,${checkBox}`

    const shipperNameArr = shipper?.name || "";
    const document_code_doc7 = `${data?.dataOpenDocument?.event_runnumber_ofo?.event_nember || "……"}/${data?.dataOpenDocument?.document_code || "……"}-${shipperNameArr || "……"}`;
    const rdoc1Find: any = {
      ...data?.data?.[0]?.item
    };

    // const gasShipper = (data?.data?.[0]?.item?.gas_shipper || [])?.filter((f:any) => {
    //     return f?.shipper?.includes(groupId)
    //   })


      const groupName = shipperNameArr


      const event_document_action = rdoc1Find?.event_document_ofo_action

      const toAction = event_document_action?.find((f: any) => (f?.user_type_id === 3 || f?.user_type_id === 4) && f?.group_id === groupId)
      const toFullname =
        toAction?.event_doc_status_id !== 1 && toAction?.event_doc_status_id !== 2 && toAction?.event_doc_status_id !== 6 && toAction?.create_by_account?.first_name && toAction?.create_by_account?.last_name ? `${toAction?.create_by_account?.first_name} ${toAction?.create_by_account?.last_name}` : ''

      // const toCompany = (toAction?.group?.company_name && toAction?.group?.company_name) || ''
      const userType_ = toAction?.group?.user_type_id // (userType_ === 3 ? ' Shipper' : "")
      const toCompany = (toAction?.group?.name && toAction?.group?.name + (userType_ === 3 ? ' Shipper' : "")) || ''
      const toDate = dayjs(toAction?.create_date).locale('th')
      const toSignature = (toAction?.event_doc_status_id !== 1 && toAction?.event_doc_status_id !== 2 && toAction?.event_doc_status_id !== 6 && toAction?.create_by_account?.signature_base_64) || '' //

      // ----
      const fromFullname = rdoc1Find?.create_by_account?.first_name && rdoc1Find?.create_by_account?.last_name ? `${rdoc1Find?.create_by_account?.first_name} ${rdoc1Find?.create_by_account?.last_name}` : ''
      // const fromCompany = 'บริษัท ปตท.จำกัด (มหาชน)'
      const fromCompany = 'PTT TSO'
      const fromSignature = rdoc1Find?.create_by_account?.signature_base_64 || '' //

      const fromDate = dayjs(rdoc1Find?.create_date).locale('th')

      const event_nember = rdoc1Find?.event_runnumber_ofo?.event_nember
      const event_doc_status = rdoc1Find?.event_doc_status?.id // 3 accept, 4 reject, 5 Acknowledge
      
      const event_runnumber = dayjs(rdoc1Find?.event_date).locale('th')
      const event_doc_ofo_type_id = rdoc1Find?.event_runnumber_ofo?.event_doc_ofo_type_id //` น. จึงขอแจ้งสิ้นสุดคำสั่งเพิ่ม/ลดปริมาณก๊าซ (${rdoc1Find?.event_runnumber_ofo?.event_doc_ofo_type_id === 1 ? 'Operation Flow Order' : 'Instructed Flow Order'}) ในเอกสารดังกล่าว และให้ผู้ใช้บริการรับ-ส่งก๊าซได้ตามปกติ`
      // text: `คําส่ังเพิ่ม/ลดปริมาณก๊าซ (${rdoc1Find?.event_runnumber_ofo?.event_doc_ofo_type_id === 1 ? 'Operation Flow Order' : 'Instructed Flow Order'})`,

      const event_doc_ofo_gas_tranmiss_other = rdoc1Find?.event_runnumber_ofo?.event_doc_ofo_gas_tranmiss_other || '___________'
      const event_doc_ofo_gas_tranmiss_id = rdoc1Find?.event_runnumber_ofo?.event_doc_ofo_gas_tranmiss_id // image: rdoc1Find?.event_runnumber_ofo?.event_doc_ofo_gas_tranmiss_id === 1 ? logoUsed : logoNotUsed,

      const doc_7_input_ref_1_id = rdoc1Find?.doc_7_input_ref_1_id // image: rdoc1Find?.doc_7_input_ref_1_id === 1 ? logocheckBoxCheck : logocheckBox,
      const doc_7_input_ref_2_id = rdoc1Find?.doc_7_input_ref_2_id // image: rdoc1Find?.doc_7_input_ref_2_id === 2 ? logocheckBoxCheck : logocheckBox,

      const input_date_time_of_the_incident = rdoc1Find?.doc_7_input_date_time_of_the_incident || '' //วัน/เวลาที่เกิดเหตุ
      const input_detail_incident = rdoc1Find?.doc_7_input_detail_incident || '' //รายละเอียดของเหตุการณ์
      const input_note = rdoc1Find?.doc_7_input_note || '' //หมายเหตุ
      const input_note_shipper = rdoc1Find?.doc_7_input_note_shipper || '' //หมายเหตุ

      const input_time_event_start_date =
        (rdoc1Find?.doc_7_input_time_event_start_date &&
          `${dayjs(rdoc1Find?.doc_7_input_time_event_start_date).locale('th').format('DD')}/${dayjs(rdoc1Find?.doc_7_input_time_event_start_date).locale('th').format('MM')}/${dayjs(rdoc1Find?.doc_7_input_time_event_start_date).locale('th').format('BBBB')}`) ||
        '' //วันที่เริ่มดำเนินการ เริ่ม วัน
      const input_time_event_start_time = rdoc1Find?.doc_7_input_time_event_start_time || '' //วันที่เริ่มดำเนินการ เริ่ม เวลา
      const input_time_event_end_date =
        (rdoc1Find?.doc_7_input_time_event_end_date && `${dayjs(rdoc1Find?.doc_7_input_time_event_end_date).locale('th').format('DD')}/${dayjs(rdoc1Find?.doc_7_input_time_event_end_date).locale('th').format('MM')}/${dayjs(rdoc1Find?.doc_7_input_time_event_end_date).locale('th').format('BBBB')}`) ||
        '' //วันที่เริ่มดำเนินการ ถึง วัน
      const input_time_event_end_time = rdoc1Find?.doc_7_input_time_event_end_time || '' //วันที่เริ่มดำเนินการ ถึง เวลา
      const longdo_dict = rdoc1Find?.longdo_dict || '' //สำเนา


      const gasShipper = (data?.data?.[0]?.item?.gas_shipper || [])?.filter((f:any) => {
        return f?.shipper?.includes(groupId)
      })
      console.log('data?.dataNomPointForDoc7 : ', data?.dataNomPointForDoc7);
      // const irShipper = Array.from({ length: 5 }, (_, i) => i)?.map(
      const irShipper = (gasShipper || [])?.flatMap((ir: any, ix: number) => {
        // group?.name
        // event_doc_gas_shipper_ofo

        const area = data?.dataNomPointForDoc7?.find((f:any) => f?.id === ir?.area)
        const nom = (area?.nom || [])?.find((f:any) => f?.id === ir?.nom_point)

        const hrLine = {
          canvas: [
            {
              type: 'line',
              x1: 0,
              y1: 0,
              x2: 400,
              y2: 0,
              lineWidth: 0.5
            }
          ],
          margin: [0, 5, 0, 5]
        }

        const data1 = {
          // dynamic
          columns: [
            // { width: 'auto', text: `space`, opacity: 0 },
            {
              width: 'auto',
              text: 'ปรับ'
            },
            {
              image: ir?.ir === 1 ? logocheckBoxCheck : logocheckBox,
              width: 12,
              height: 12,
              margin: [0, 0, 3, 0]
            },
            {
              width: 'auto',
              text: 'เพิ่ม / '
            },
            {
              image: ir?.ir === 2 ? logocheckBoxCheck : logocheckBox,
              width: 12,
              height: 12,
              margin: [0, 0, 3, 0]
            },
            {
              width: 'auto',
              text: 'ลดปริมาณก๊าซของผู้ใช้บริการ '
            },
            {
              width: 'auto',
              text: `${groupName}`,
              decoration: 'underline'
            }
          ],
          columnGap: 5,
          margin: [0, 0, 0, 5]
        }

        const dataI = {
          // dynamic
          columns: [
            // { width: 'auto', text: `space`, opacity: 0 },
            {
              image: ir?.io === 3 ? logocheckBoxCheck : logocheckBox,
              width: 12,
              height: 12,
              margin: [0, 0, 3, 0]
            },
            {
              width: 'auto',
              text: 'จุดส่งเข้า '
            },
            {
              width: 'auto',
              text: `${(ir?.io === 3 && `${area?.name || ''} จุดเชื่อมต่อจาก (${nom?.nomination_point})`) || '________'}`,
              ...(ir?.io === 3 &&
                nom?.nomination_point && {
                  decoration: 'underline'
                })
            }
          ],
          columnGap: 5,
          margin: [0, 0, 0, 5]
        }

        const dataIValue = {
          // dynamic
          columns: [
            // { width: 'auto', text: `space`, opacity: 0 },
            {
              width: 'auto',
              text: 'ปริมาณ '
            },
            {
              width: 'auto',
              text: `${(ir?.io === 3 && !!ir?.nom_value_mmscfh && ir?.nom_value_mmscfh) || '________'}`,
              ...(ir?.io === 3 &&
                !!ir?.nom_value_mmscfh && {
                  decoration: 'underline'
                })
            }
          ],
          columnGap: 5,
          margin: [0, 0, 0, 5]
        }

        const dataO = {
          columns: [
            {
              image: ir?.io === 4 ? logocheckBoxCheck : logocheckBox,
              width: 12,
              height: 12,
              margin: [0, 0, 3, 0]
            },
            {
              width: 'auto',
              text: 'จุดจ่ายออก '
            },
            {
              width: 'auto',
              text: `${(ir?.io === 4 && `${area?.name || ''} จุดเชื่อมต่อจาก (${nom?.nomination_point})`) || '________'}`,
              ...(ir?.io === 4 &&
                nom?.nomination_point && {
                  decoration: 'underline'
                })
            }
          ],
          columnGap: 5,
          margin: [0, 0, 0, 5]
        }

        const dataOValue = {
          // dynamic
          columns: [
            // { width: 'auto', text: `space`, opacity: 0 },
            {
              width: 'auto',
              text: 'ปริมาณ '
            },
            {
              width: 'auto',
              text: `${(ir?.io === 4 && !!ir?.nom_value_mmscfh && ir?.nom_value_mmscfh) || '________'}`,
              ...(ir?.io === 4 &&
                !!ir?.nom_value_mmscfh && {
                  decoration: 'underline'
                })
            }
          ],
          columnGap: 5,
          margin: [0, 0, 0, 5]
        }

        return [data1, dataI, dataIValue, dataO, dataOValue] // https://app.clickup.com/t/86eum0nt8
        // return [data1, dataI, dataIValue, hrLine, dataO, dataOValue];
      })

      ;(pdfMake as any).vfs = vfs
      const fonts = {
        THSarabun: {
          normal: 'THSarabunNew.ttf',
          bold: 'THSarabunNew-Bold.ttf',
          italics: 'THSarabunNew.ttf',
          bolditalics: 'THSarabunNew-Bold.ttf'
        }
      }
      ;(pdfMake as any).fonts = fonts
      const docDefinition = {
        header: (currentPage:any, pageCount:any) => {
          return {
            columns: [
              {
                width: '*',
                text: ''
              }, // เว้นซ้าย
              {
                width: 'auto',
                stack: [
                  {
                    // text: `เลขที่เอกสาร: …………${event_nember}…………`,
                    text: `เลขที่เอกสาร: …………${document_code_doc7}…………`,
                    fontSize: 12,
                    alignment: 'right'
                  },
                  {
                    text: `วันเดือนปีเอกสาร: ……${event_runnumber.format('DD')}…/……${event_runnumber.format('MMM')}……${event_runnumber.format('BBBB')}…………`,
                    fontSize: 12,
                    alignment: 'right'
                  }
                ],
                margin: [0, 5, 10, 0] // [left, top, right, bottom],
              }
            ]
          }
        },
        content: [
          {
            image: logoImage,
            width: 70,
            alignment: 'center',
            margin: [0, 0, 0, 10]
          },

          {
            text: `คําส่ังเพิ่ม/ลดปริมาณก๊าซ (${event_doc_ofo_type_id === 1 ? 'Operation Flow Order' : 'Instructed Flow Order'})`,
            alignment: 'center',
            fontSize: 18,
            bold: true,
            margin: [0, 0, 0, 5]
          },

          // ======== กรอบ "เรียน / สำเนา" =========
          {
            table: {
              widths: ['auto', '*'],
              body: [
                [
                  {
                    text: 'ส่ง:',
                    bold: true,
                    alignment: 'center',
                    verticalAlignment: 'middle',
                    margin: [0, 10, 0, 10]
                  },
                  {
                    stack: [
                      // 'ส่วนปฏิบัติกํารรับจ่ํายก๊ําซธรรมชําติรํายวัน (Intra-day Natural Gas Operations Division)',
                      `${groupName}`
                    ],
                    margin: [0, 10, 0, 10] // << บังคับความสูงให้จัดกลาง
                  }
                ],
                [
                  {
                    text: 'สำเนา:',
                    bold: true,
                    alignment: 'center',
                    verticalAlignment: 'middle',
                    margin: [0, 10, 0, 10]
                  },
                  {
                    stack: [
                      `${longdo_dict || ''}`
                      //
                    ],
                    margin: [0, 10, 0, 10] // << บังคับความสูงให้จัดกลาง
                  }
                ]
              ]
            },
            layout: {
              hLineWidth: () => 0.5,
              vLineWidth: () => 0.5
            },
            margin: [0, 0, 0, 0]
          },

          // ======== กรอบ "ระบบส่งก๊าซ" =========
          {
            table: {
              widths: ['*'],
              body: [
                [
                  {
                    stack: [
                      {
                        text: '(1.) ระบบส่งก๊าซ',
                        bold: true,
                        // decoration: 'underline',
                        margin: [0, 0, 0, 5]
                      },
                      {
                        columns: [
                          // { width: 'auto', text: `space`, opacity: 0 },
                          {
                            image: event_doc_ofo_gas_tranmiss_id === 1 ? logoUsed : logoNotUsed,
                            width: 12,
                            height: 12,
                            margin: [0, 0, 3, 0]
                          },
                          {
                            width: 'auto',
                            text: 'Onshore East'
                          },
                          {
                            image: event_doc_ofo_gas_tranmiss_id === 2 ? logoUsed : logoNotUsed,
                            width: 12,
                            height: 12,
                            margin: [0, 0, 3, 0]
                          },
                          {
                            width: 'auto',
                            text: 'Onshore West'
                          },
                          {
                            image: event_doc_ofo_gas_tranmiss_id === 3 ? logoUsed : logoNotUsed,
                            width: 12,
                            height: 12,
                            margin: [0, 0, 3, 0]
                          },
                          {
                            width: 'auto',
                            text: 'Onshore East - West'
                          },
                          {
                            image: event_doc_ofo_gas_tranmiss_id === 4 ? logoUsed : logoNotUsed,
                            width: 12,
                            height: 12,
                            margin: [0, 0, 3, 0]
                          },
                          {
                            width: 'auto',
                            text: 'Other:'
                          },
                          {
                            width: 'auto',
                            text: `${event_doc_ofo_gas_tranmiss_other}`
                          }
                        ],
                        columnGap: 5,
                        margin: [0, 0, 0, 5]
                      }
                    ],
                    margin: [5, 5, 5, 5]
                  }
                ]
              ]
            },
            layout: {
              hLineWidth: () => 0.5,
              vLineWidth: () => 0.5
            },
            margin: [0, 0, 0, 0]
          },

          // ======== กรอบ =========
          {
            table: {
              widths: ['*'],
              body: [
                [
                  {
                    stack: [
                      {
                        columns: [
                          // { width: 'auto', text: `space`, opacity: 0 },
                          {
                            image: doc_7_input_ref_1_id === 1 ? logocheckBoxCheck : logocheckBox,
                            width: 12,
                            height: 12,
                            margin: [0, 0, 3, 0]
                          },
                          {
                            width: 'auto',
                            text: 'อ้างอิง TSO Code ข้อที่ 8.8.4.5 เนื่องจากความไม่สมดุลของระบบส่งก๊าซ เข้าใกล้ขีดจำกัดที่ระบบจะสามารถรองรับจึงออกคำสั่ง Operational Flow Order เพื่อรักษาเสถียรภาพของระบบส่งก๊าซ'
                          }
                        ],
                        columnGap: 5,
                        margin: [0, 0, 0, 5]
                      },
                      {
                        columns: [
                          // { width: 'auto', text: `space`, opacity: 0 },
                          {
                            image: doc_7_input_ref_2_id === 2 ? logocheckBoxCheck : logocheckBox,
                            width: 12,
                            height: 12,
                            margin: [0, 0, 3, 0]
                          },
                          {
                            width: 'auto',
                            text: 'อ้างอิง TSO Code ข้อที่ 8.4.1.1(ง), 8.4.1.1(ฌ) และ 8.4.1.2 (ข) เพื่อควบคุมคุณภาพก๊าซรวมที่เข้าสู่ระบบให้เป็นไปตามข้อกำหนดคุณภาพก๊าซควบคุมที่เขตส่งมอบก๊าซ และเพื่อไม่ให้เกิดผลกระทบต่อผู้ใช้บริการและผู้ใช้ก๊าซจึงออกคำสั่ง Operational Flow Order'
                          }
                        ],
                        columnGap: 5,
                        margin: [0, 0, 0, 5]
                      },
                      {
                        columns: [
                          // { width: 'auto', text: `space`, opacity: 0 },
                          {
                            width: 'auto',
                            text: `วันที่ / เวลา ที่เกิดเหตุการณ์:`
                          },
                          {
                            width: 'auto',
                            text: `${input_date_time_of_the_incident}`,
                            decoration: 'underline'
                          }
                        ],
                        columnGap: 5,
                        margin: [0, 0, 0, 5]
                      },
                      {
                        columns: [
                          // { width: 'auto', text: `space`, opacity: 0 },
                          {
                            width: 'auto',
                            text: 'รายละเอียดเหตุการณ์ความไม่สมดุล หรือเหตุการณ์เพื่อควบคุมคุณภาพก๊าซที่ต้องสั่งการอย่างจำเป็นเร่งด่วนเพื่อปกป้อง หรือระงับความเสียหายหรืออันตรายที่อาจเกิดขึ้นกับระบบส่งก๊าซ และรายละเอียดการสั่งการ: '
                          }
                        ],
                        columnGap: 5,
                        margin: [0, 0, 0, 5]
                      },
                      {
                        columns: [
                          // { width: 'auto', text: `space`, opacity: 0 },
                          {
                            width: 'auto',
                            text: `${input_detail_incident}`,
                            decoration: 'underline'
                          }
                        ],
                        columnGap: 5,
                        margin: [0, 0, 0, 5]
                      },
                      ...irShipper,
                      {
                        columns: [
                          // { width: 'auto', text: `space`, opacity: 0 },
                          // { width: 'auto', text: `โดยอย่างช้าให้เริ่มดำเนินการตั้งแต่  น. วันที่ และดำเนินการให้แล้วเสร็จภายใน 00:01 น.วันที่ 13/08/2566` },
                          {
                            width: 'auto',
                            text: `โดยอย่างช้าให้เริ่มดำเนินการตั้งแต่`
                          },
                          {
                            width: 'auto',
                            text: `${input_time_event_start_date}`,
                            decoration: 'underline'
                          },
                          {
                            width: 'auto',
                            text: ` น. วันที่ `
                          },
                          {
                            width: 'auto',
                            text: `${input_time_event_start_time}`,
                            decoration: 'underline'
                          },
                          ...(input_time_event_end_date && [

                            {
                              width: 'auto',
                              text: ` ให้แล้วเสร็จภายใน `
                              // text: ` และดำเนินการให้แล้วเสร็จภายใน `
                            },
                            {
                              width: 'auto',
                              text: `${input_time_event_end_date}`,
                              decoration: 'underline'
                            },
                            {
                              width: 'auto',
                              text: ` น.วันที่ `
                            },
                            {
                              width: 'auto',
                              text: `${input_time_event_end_time}`,
                              decoration: 'underline'
                            }
                          ]),
                        ],
                        columnGap: 5,
                        margin: [0, 0, 0, 5]
                      },
                      {
                        columns: [
                          // { width: 'auto', text: `space`, opacity: 0 },
                          {
                            width: 'auto',
                            text: `หมายเหตุ:`
                          },
                          {
                            width: 'auto',
                            text: `${input_note}`,
                            decoration: 'underline'
                          }
                        ],
                        columnGap: 5,
                        margin: [0, 0, 0, 5]
                      },
                      {
                        columns: [
                          // { width: 'auto', text: `space`, opacity: 0 },
                          {
                            width: 'auto',
                            bold: true,
                            text: `ส่วนของผู้ใช้บริการ/คู่สัญญาของผู้ใช้บริการ`
                          },
                        ],
                        columnGap: 5,
                        margin: [0, 0, 0, 5]
                      },
                      {
                        columns: [
                          // { width: 'auto', text: `space`, opacity: 0 },
                          {
                            width: 'auto',
                            text: `หมายเหตุ:`
                          },
                          {
                            width: 'auto',
                            text: `${input_note_shipper}`,
                            decoration: 'underline'
                          }
                        ],
                        columnGap: 5,
                        margin: [0, 0, 0, 5]
                      },
                    ],
                    margin: [5, 5, 5, 5]
                  }
                ]
              ]
            },
            layout: {
              hLineWidth: () => 0.5,
              vLineWidth: () => 0.5
            },
            margin: [0, 0, 0, 0]
          },

          // ======== กรอบช่องเซ็นชื่อ =========
          {
            table: {
              widths: ['*', '*'],
              body: [
                [
                  {
                    stack: [
                      // { text: `แจ้งโดย ${fromFullname}` },
                      // fromSignature
                      //   ? {
                      //       columns: [
                      //         { text: '(', width: 'auto', alignment: 'right' },
                      //         {
                      //           image: fromSignature, // base64 หรือ path
                      //           width: 50,
                      //           alignment: 'center',
                      //         },
                      //         { text: ')', width: 'auto', alignment: 'left' },
                      //       ],
                      //       columnGap: 15, // ระยะห่างระหว่างวงเล็บกับภาพ
                      //       margin: [0, 2, 0, 5], // ปรับระยะรอบภาพ
                      //     }
                      //   : { text: `(                                   )` },
                      fromSignature
                        ? {
                            columns: [
                              {
                                // text: 'รับทราบโดย',
                                text: 'แจ้งโดย', // https://app.clickup.com/t/86eum0p1r
                                width: 'auto',
                                alignment: 'right'
                              },
                              {
                                image: fromSignature, // base64 หรือ path
                                width: 50,
                                alignment: 'center'
                              }
                            ],
                            columnGap: 15, // ระยะห่างระหว่างวงเล็บกับภาพ
                            margin: [0, 2, 0, 5] // ปรับระยะรอบภาพ
                          }
                        : {
                            text: `แจ้งโดย `
                          },
                      {
                        text: fromFullname ? `( ${fromFullname} )` : `(                                   )`
                      },
                      {
                        text: `หน่วยงาน ${fromCompany} (ผู้ให้บริการ)`
                      },
                      {
                        text: `เวลา : ${fromDate.format('HH:mm')} น. วันที่/เดือน/ปี: ${fromDate.format('DD')} / ${fromDate.format('MM')} / ${fromDate.format('BB')}`
                      }
                    ],
                    margin: [5, 5, 5, 5]
                  },
                  {
                    stack: [
                      // { text: `รับทราบโดย${rdoc1Find?.event_doc_status?.id === 2 ? ' ' : toFullname}` },
                      // rdoc1Find?.event_doc_status?.id === 5 && toSignature
                      event_doc_status === 5 && toSignature
                        ? {
                            columns: [
                              {
                                text: 'รับทราบโดย',
                                width: 'auto',
                                alignment: 'right'
                              },
                              // { text: 'รับทราบโดย', width: 'auto', alignment: 'right' },
                              {
                                image: toSignature, // base64 หรือ path
                                width: 50,
                                alignment: 'center'
                              }
                              // { text: ')', width: 'auto', alignment: 'left' },
                            ],
                            columnGap: 5, // ระยะห่างระหว่างวงเล็บกับภาพ
                            margin: [0, 2, 0, 5] // ปรับระยะรอบภาพ
                          }
                        : {
                            text: `รับทราบโดย`
                          },
                      {
                        text: event_doc_status === 5 ? `(${toFullname})` : '(…………………………………………………………)'
                      },
                      {
                        text: `หน่วยงาน ${event_doc_status === 2 ? '………………………………………………………………' : toCompany}`
                      },
                      {
                        text: `(ผู้ใช้บริการ/คู่สัญญาของผู้ใช้บริการ/ผู้เกี่ยวข้อง)`,
                        width: 'auto',
                        alignment: 'center'
                      },
                      {
                        text: `เวลา : ${event_doc_status === 2 ? ' ' : toDate.format('HH:mm')} น. วันที่/เดือน/ปี: ${event_doc_status === 2 ? ' ' : toDate.format('DD')} / ${event_doc_status === 2 ? ' ' : toDate.format('MM')} / ${event_doc_status === 2 ? ' ' : toDate.format('BB')}`
                      }
                    ],
                    margin: [5, 5, 5, 5]
                  }
                ]
              ]
            },
            layout: {
              hLineWidth: () => 0.5,
              vLineWidth: () => 0.5
            },
            margin: [0, 0, 0, 0]
          }

          // ======== Footer ========
          // {
          //   text: 'F–บก.บกคด.–0023 ประกาศใช้ 05/11/2564 เวอร์ชั่น 4',
          //   alignment: 'left',
          //   fontSize: 10,
          //   bold: true,
          //   margin: [0, 10, 0, 0],
          // },
        ],
        defaultStyle: {
          font: 'THSarabun',
          fontSize: 14
          // characterSpacing: -0.5,
        }
      }

    return docDefinition;

}