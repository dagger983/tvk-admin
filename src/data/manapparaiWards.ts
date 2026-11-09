// d:\Project\TVK Admin\src\data\manapparaiWards.ts
import { Ward, WardRepresentative } from '../types';

export const MANAPPARAI_WARDS: Ward[] = [
  {
    id: 'W01',
    ward_number: 1,
    ward_code: 'MNP-W01',
    name_en: 'Ward 1 - Gandhi Nagar & Kamaraj Salai',
    name_ta: 'வார்டு 1 - காந்தி நகர் & காமராஜ் சாலை',
    key_localities: ['Gandhi Nagar', 'Kamaraj Salai', 'East Gate', 'Kavery Nagar'],
    center_lat: 10.6120,
    center_lng: 78.4350,
    representative_id: 'REP-W01',
    representative_name: 'M. Vijayakumar',
    representative_phone: '+91 9442011621',
    is_active: true,
  },
  {
    id: 'W02',
    ward_number: 2,
    ward_code: 'MNP-W02',
    name_en: 'Ward 2 - Old Bus Stand & Market Road',
    name_ta: 'வார்டு 2 - பழைய பேருந்து நிலையம் & கடைவீதி',
    key_localities: ['Old Bus Stand', 'Daily Market', 'Bazaar Street', 'Perumal Kovil Street'],
    center_lat: 10.6095,
    center_lng: 78.4330,
    representative_id: 'REP-W02',
    representative_name: 'S. Selvaraj',
    representative_phone: '+91 9442011622',
    is_active: true,
  },
  {
    id: 'W03',
    ward_number: 3,
    ward_code: 'MNP-W03',
    name_en: 'Ward 3 - Railway Station Colony',
    name_ta: 'வார்டு 3 - ரயில்வே ஸ்டேஷன் காலனி',
    key_localities: ['Railway Colony', 'Station Road', 'Overbridge North', 'Goods Shed'],
    center_lat: 10.6050,
    center_lng: 78.4380,
    representative_id: 'REP-W03',
    representative_name: 'K. Anbalagan',
    representative_phone: '+91 9442011623',
    is_active: true,
  },
  {
    id: 'W04',
    ward_number: 4,
    ward_code: 'MNP-W04',
    name_en: 'Ward 4 - Anna Nagar & Anna Park',
    name_ta: 'வார்டு 4 - அண்ணா நகர் & அண்ணா பூங்கா',
    key_localities: ['Anna Nagar', 'Anna Park', 'Park Main Road', 'VIP Nagar', 'Teacher Colony'],
    center_lat: 10.6074,
    center_lng: 78.4336,
    representative_id: 'REP-W04',
    representative_name: 'R. Senthil Kumar (TVK)',
    representative_phone: '+91 9442011624',
    is_active: true,
  },
  {
    id: 'W05',
    ward_number: 5,
    ward_code: 'MNP-W05',
    name_en: 'Ward 5 - Sevalur North & Kovilpatti Road',
    name_ta: 'வார்டு 5 - செவலூர் வடக்கு & கோவில்பட்டி சாலை',
    key_localities: ['Sevalur North', 'Kovilpatti Road', 'Mariamman Kovil St', 'MGR Nagar'],
    center_lat: 10.6150,
    center_lng: 78.4280,
    representative_id: 'REP-W05',
    representative_name: 'P. Murugesan',
    representative_phone: '+91 9442011625',
    is_active: true,
  },
  {
    id: 'W06',
    ward_number: 6,
    ward_code: 'MNP-W06',
    name_en: 'Ward 6 - Sevalur South & Checkpost Area',
    name_ta: 'வார்டு 6 - செவலூர் தெற்கு & சோதனைச்சாவடி',
    key_localities: ['Sevalur South', 'Old Checkpost', 'Panchayat Union Office', 'Kaveri Street'],
    center_lat: 10.6180,
    center_lng: 78.4240,
    representative_id: 'REP-W06',
    representative_name: 'A. Francis Xavier',
    representative_phone: '+91 9442011626',
    is_active: true,
  },
  {
    id: 'W07',
    ward_number: 7,
    ward_code: 'MNP-W07',
    name_en: 'Ward 7 - Dindigul Main Road & By-pass',
    name_ta: 'வார்டு 7 - திண்டுக்கல் பிரதான சாலை & பைபாஸ்',
    key_localities: ['Dindigul Road', 'Four Road Junction', 'Bypass Ring Road', 'Murugan Talkies'],
    center_lat: 10.6010,
    center_lng: 78.4270,
    representative_id: 'REP-W07',
    representative_name: 'G. Jayakumar',
    representative_phone: '+91 9442011627',
    is_active: true,
  },
  {
    id: 'W08',
    ward_number: 8,
    ward_code: 'MNP-W08',
    name_en: 'Ward 8 - Madurai Road & Kaniyalampatti',
    name_ta: 'வார்டு 8 - மதுரை சாலை & கனியாலம்பட்டி',
    key_localities: ['Madurai Road', 'Kaniyalampatti Road', 'State Bank Colony', 'LIC Nagar'],
    center_lat: 10.5980,
    center_lng: 78.4310,
    representative_id: 'REP-W08',
    representative_name: 'M. Dharmaraj',
    representative_phone: '+91 9442011628',
    is_active: true,
  },
  {
    id: 'W09',
    ward_number: 9,
    ward_code: 'MNP-W09',
    name_en: 'Ward 9 - Government Hospital & Court Area',
    name_ta: 'வார்டு 9 - அரசு மருத்துவமனை & நீதிமன்ற வளாகம்',
    key_localities: ['Government Hospital', 'Judicial Court', 'Combined Office Complex', 'Taluk Office'],
    center_lat: 10.6030,
    center_lng: 78.4360,
    representative_id: 'REP-W09',
    representative_name: 'Dr. C. Saravanan',
    representative_phone: '+91 9442011629',
    is_active: true,
  },
  {
    id: 'W10',
    ward_number: 10,
    ward_code: 'MNP-W10',
    name_en: 'Ward 10 - Trichy Road Industrial Estate',
    name_ta: 'வார்டு 10 - திருச்சி சாலை தொழிற்பேட்டை',
    key_localities: ['SIDCO Industrial Estate', 'Trichy Main Road', 'New Flyover South', 'Rice Mill Road'],
    center_lat: 10.6135,
    center_lng: 78.4410,
    representative_id: 'REP-W10',
    representative_name: 'T. Karuppaiah',
    representative_phone: '+91 9442011630',
    is_active: true,
  },
  {
    id: 'W11',
    ward_number: 11,
    ward_code: 'MNP-W11',
    name_en: 'Ward 11 - Usilampatti & Poolankulathupatti',
    name_ta: 'வார்டு 11 - உசிலம்பட்டி & பூலாங்குளத்துப்பட்டி',
    key_localities: ['Usilampatti', 'Poolankulathupatti', 'Amman Nagar', 'Lake View Road'],
    center_lat: 10.6220,
    center_lng: 78.4310,
    representative_id: 'REP-W11',
    representative_name: 'K. Muthusamy',
    representative_phone: '+91 9442011631',
    is_active: true,
  },
  {
    id: 'W12',
    ward_number: 12,
    ward_code: 'MNP-W12',
    name_en: 'Ward 12 - Ponnaniyar Road & New Bus Stand',
    name_ta: 'வார்டு 12 - பொன்னணியாறு சாலை & புதிய பேருந்து நிலையம்',
    key_localities: ['New Bus Stand', 'Ponnaniyar Dam Road', 'Depot Colony', 'Uzhavar Santhai'],
    center_lat: 10.6090,
    center_lng: 78.4375,
    representative_id: 'REP-W12',
    representative_name: 'V. Sundaram (TVK Lead)',
    representative_phone: '+91 9442011632',
    is_active: true,
  },
];

export const INITIAL_REPRESENTATIVES: WardRepresentative[] = [
  {
    id: 'REP-W01',
    name: 'M. Vijayakumar',
    phone: '+91 9442011621',
    email: 'rep.ward01@tvk.org.in',
    ward_number: 1,
    ward_name: 'Ward 1 - Gandhi Nagar',
    status: 'active',
    assigned_count: 14,
    acknowledged_count: 14,
    in_progress_count: 3,
    resolved_count: 11,
    overdue_count: 0,
    avg_resolution_hours: 22,
    last_active: '10 mins ago',
  },
  {
    id: 'REP-W02',
    name: 'S. Selvaraj',
    phone: '+91 9442011622',
    email: 'rep.ward02@tvk.org.in',
    ward_number: 2,
    ward_name: 'Ward 2 - Old Bus Stand',
    status: 'active',
    assigned_count: 19,
    acknowledged_count: 18,
    in_progress_count: 5,
    resolved_count: 13,
    overdue_count: 1,
    avg_resolution_hours: 28,
    last_active: '25 mins ago',
  },
  {
    id: 'REP-W03',
    name: 'K. Anbalagan',
    phone: '+91 9442011623',
    email: 'rep.ward03@tvk.org.in',
    ward_number: 3,
    ward_name: 'Ward 3 - Railway Station',
    status: 'active',
    assigned_count: 8,
    acknowledged_count: 8,
    in_progress_count: 2,
    resolved_count: 6,
    overdue_count: 0,
    avg_resolution_hours: 19,
    last_active: '1 hour ago',
  },
  {
    id: 'REP-W04',
    name: 'R. Senthil Kumar (TVK)',
    phone: '+91 9442011624',
    email: 'rep.ward04@tvk.org.in',
    ward_number: 4,
    ward_name: 'Ward 4 - Anna Nagar',
    status: 'active',
    assigned_count: 26,
    acknowledged_count: 25,
    in_progress_count: 6,
    resolved_count: 19,
    overdue_count: 1,
    avg_resolution_hours: 24,
    last_active: 'Just now',
  },
  {
    id: 'REP-W05',
    name: 'P. Murugesan',
    phone: '+91 9442011625',
    email: 'rep.ward05@tvk.org.in',
    ward_number: 5,
    ward_name: 'Ward 5 - Sevalur North',
    status: 'active',
    assigned_count: 12,
    acknowledged_count: 11,
    in_progress_count: 4,
    resolved_count: 7,
    overdue_count: 1,
    avg_resolution_hours: 32,
    last_active: '3 hours ago',
  },
  {
    id: 'REP-W12',
    name: 'V. Sundaram (TVK Lead)',
    phone: '+91 9442011632',
    email: 'rep.ward12@tvk.org.in',
    ward_number: 12,
    ward_name: 'Ward 12 - New Bus Stand',
    status: 'active',
    assigned_count: 21,
    acknowledged_count: 21,
    in_progress_count: 4,
    resolved_count: 16,
    overdue_count: 0,
    avg_resolution_hours: 18,
    last_active: '5 mins ago',
  },
];

/**
 * Intelligent Automatic Ward Identification Algorithm
 */
export function identifyWardForComplaint(params: {
  lat?: number | null;
  lng?: number | null;
  landmark?: string | null;
  citizenWard?: string | null;
  title?: string | null;
  description?: string | null;
}): {
  wardNumber: number;
  wardName: string;
  representative: WardRepresentative | null;
  confidence: 'High' | 'Medium' | 'Low' | 'Verification Required';
  matchedBy: 'Citizen Selection' | 'GPS Coordinates' | 'Landmark / Locality' | 'Default';
} {
  const { lat, lng, landmark, citizenWard, title, description } = params;

  // 1. Check if citizen explicitly selected a Ward or citizen profile has it
  if (citizenWard) {
    const numMatch = citizenWard.match(/\d+/);
    if (numMatch) {
      const wardNum = parseInt(numMatch[0], 10);
      const wardObj = MANAPPARAI_WARDS.find(w => w.ward_number === wardNum);
      if (wardObj) {
        const rep = INITIAL_REPRESENTATIVES.find(r => r.ward_number === wardNum) || null;
        return {
          wardNumber: wardObj.ward_number,
          wardName: wardObj.name_en,
          representative: rep,
          confidence: 'High',
          matchedBy: 'Citizen Selection',
        };
      }
    }
  }

  // 2. Keyword match in landmark, title or description
  const combinedText = `${landmark || ''} ${title || ''} ${description || ''}`.toLowerCase();
  for (const ward of MANAPPARAI_WARDS) {
    // Check ward number in text (e.g. "ward 4", "வார்டு 4")
    if (
      combinedText.includes(`ward ${ward.ward_number}`) ||
      combinedText.includes(`ward-${ward.ward_number}`) ||
      combinedText.includes(`வார்டு ${ward.ward_number}`)
    ) {
      const rep = INITIAL_REPRESENTATIVES.find(r => r.ward_number === ward.ward_number) || null;
      return {
        wardNumber: ward.ward_number,
        wardName: ward.name_en,
        representative: rep,
        confidence: 'High',
        matchedBy: 'Landmark / Locality',
      };
    }

    // Check locality names
    for (const loc of ward.key_localities) {
      if (combinedText.includes(loc.toLowerCase())) {
        const rep = INITIAL_REPRESENTATIVES.find(r => r.ward_number === ward.ward_number) || null;
        return {
          wardNumber: ward.ward_number,
          wardName: ward.name_en,
          representative: rep,
          confidence: 'Medium',
          matchedBy: 'Landmark / Locality',
        };
      }
    }
  }

  // 3. Coordinate distance calculation (Euclidean approximation)
  if (lat && lng && lat > 10.0 && lat < 11.0 && lng > 78.0 && lng < 79.0) {
    let closestWard: Ward | null = null;
    let minDistance = Infinity;

    for (const ward of MANAPPARAI_WARDS) {
      const dLat = ward.center_lat - lat;
      const dLng = ward.center_lng - lng;
      const dist = Math.sqrt(dLat * dLat + dLng * dLng);
      if (dist < minDistance) {
        minDistance = dist;
        closestWard = ward;
      }
    }

    if (closestWard) {
      const rep = INITIAL_REPRESENTATIVES.find(r => r.ward_number === closestWard.ward_number) || null;
      // Close distance (< ~1km) is Medium confidence, further is Low
      const confidence = minDistance < 0.015 ? 'Medium' : 'Low';
      return {
        wardNumber: closestWard.ward_number,
        wardName: closestWard.name_en,
        representative: rep,
        confidence: confidence,
        matchedBy: 'GPS Coordinates',
      };
    }
  }

  // 4. Default / Fallback: Ward 4 (Central Anna Nagar) with Verification Required flag
  const defaultWard = MANAPPARAI_WARDS[3];
  const defaultRep = INITIAL_REPRESENTATIVES.find(r => r.ward_number === defaultWard.ward_number) || null;
  return {
    wardNumber: defaultWard.ward_number,
    wardName: defaultWard.name_en,
    representative: defaultRep,
    confidence: 'Verification Required',
    matchedBy: 'Default',
  };
}

