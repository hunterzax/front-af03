import React, { useEffect, useRef, useState } from "react";
import {
  GoogleMap,
  KmlLayer,
  LoadScript,
  Marker,
  OverlayView,
  Polyline,
  Rectangle,
} from "@react-google-maps/api";
import { getService } from "@/utils/postService";

interface MapProps {
  AreaPos?: any;
}

const containerStyle = {
  width: "100%",
  height: "65vh",
};

const center = {
  lat: 13.6556899,
  lng: 100.6475066,
};

const GG_TOKEN: any = process.env.NEXT_PUBLIC_GG_MAPS

const GoogleMapComponent: React.FC<MapProps> = ({ AreaPos }) => {
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const overlayRefs = useRef<google.maps.GroundOverlay[]>([]);
  const [dataArea, setDataArea] = useState<any>([]);
  const [dataAreaApi, setDataAreaApi] = useState([])
  const [ggToken, setGgToken] = useState('')
  useEffect(() => {
    setGgToken(GG_TOKEN)
  }, [GG_TOKEN])

  const getInitApi = async () => {
    const responseApi: any = await getService(
      `/master/other-service/area-line-map`
    );
    setDataAreaApi(responseApi || [])
  };

  useEffect(() => {
    if (!map) return; // ถ้ายังไม่มี map ไม่ต้องทำอะไร

    // เคลียร์ GroundOverlay เก่าทิ้งก่อนสร้างใหม่
    overlayRefs.current.forEach((overlay) => overlay.setMap(null));
    overlayRefs.current = []; // รีเซ็ตค่าใน overlayRefs

    dataArea.forEach((overlay: any) => {
      const { north, south, east, west } = overlay.original_lat_lon_box;

      const bounds = new google.maps.LatLngBounds(
        new google.maps.LatLng(south, west), // มุมซ้ายล่าง
        new google.maps.LatLng(north, east) // มุมขวาบน
      );

      const newOverlay = new google.maps.GroundOverlay(
        overlay.original_url,
        bounds,
        {
          map: map,
          opacity: 1.0, // ทำให้รูปไม่โปร่งแสง
        }
      );

      overlayRefs.current.push(newOverlay); // บันทึก overlay ใหม่ลง ref

    });
  }, [dataArea, map]);

  useEffect(() => {
    if (dataAreaApi && Array.isArray(dataAreaApi)) {
      const filteredData = dataAreaApi?.filter((item: any) =>
        AreaPos.includes(item.area_split)
      ) || [];
      setDataArea(filteredData);
    }
  }, [AreaPos, dataAreaApi]);

  useEffect(() => {
    getInitApi();
  }, []);

  return (
    <LoadScript googleMapsApiKey={ggToken || ""}>
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={center}
        zoom={8}
        onLoad={(mapInstance) => setMap(mapInstance)}
        options={{ // เปิดตอนทำ CR ในอนาคต by ผู้รู้อนาคต
          styles: [
            // ซ่อนทุกอย่างที่เป็นระบบขนส่งสาธารณะ (รถไฟฟ้า/รถเมล์/สถานี)
            { featureType: "transit", stylers: [{ visibility: "off" }] },

            // ถ้าอยากซ่อนเฉพาะ “เส้นทางรถไฟฟ้า” ลองใช้แบบเจาะจง:
            // { featureType: "transit.line", stylers: [{ visibility: "off" }] },
            // { featureType: "transit.station", stylers: [{ visibility: "off" }] },
          ],
        }}
      >
        {/* --------- */}
      </GoogleMap>
    </LoadScript>
  );
};

export default GoogleMapComponent;
