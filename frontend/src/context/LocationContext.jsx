import React, { createContext, useState, useContext, useEffect } from 'react';

const LocationContext = createContext();

export const statesList = [
  {
    name: 'Andhra Pradesh',
    districts: ['Visakhapatnam', 'Vijayawada', 'Guntur', 'Tirupati', 'Kurnool', 'Nellore', 'Rajahmundry', 'Kakinada']
  },
  {
    name: 'Arunachal Pradesh',
    districts: ['Itanagar', 'Naharlagun', 'Tawang', 'Ziro', 'Pasighat']
  },
  {
    name: 'Assam',
    districts: ['Guwahati', 'Silchar', 'Dibrugarh', 'Jorhat', 'Nagaon', 'Tinsukia', 'Tezpur', 'Kamrup']
  },
  {
    name: 'Bihar',
    districts: ['Patna', 'Gaya', 'Muzaffarpur', 'Bhagalpur', 'Darbhanga', 'Purnia', 'Arrah', 'Begusarai', 'Katihar', 'Munger']
  },
  {
    name: 'Chhattisgarh',
    districts: ['Raipur', 'Bilaspur', 'Durg', 'Bhilai', 'Korba', 'Rajnandgaon', 'Jagdalpur', 'Ambikapur']
  },
  {
    name: 'Delhi',
    districts: ['New Delhi', 'North Delhi', 'South Delhi', 'West Delhi', 'East Delhi', 'Central Delhi', 'Dwarka', 'Rohini']
  },
  {
    name: 'Goa',
    districts: ['Panaji', 'Margao', 'Vasco da Gama', 'Mapusa', 'Ponda']
  },
  {
    name: 'Gujarat',
    districts: ['Ahmedabad', 'Surat', 'Vadodara', 'Rajkot', 'Gandhinagar', 'Bhavnagar', 'Jamnagar', 'Mehsana', 'Anand', 'Bharuch']
  },
  {
    name: 'Haryana',
    districts: ['Gurugram', 'Faridabad', 'Panipat', 'Rohtak', 'Hisar', 'Karnal', 'Ambala', 'Sonipat', 'Yamunanagar', 'Bhiwani']
  },
  {
    name: 'Himachal Pradesh',
    districts: ['Shimla', 'Manali', 'Dharamsala', 'Solan', 'Mandi', 'Kullu', 'Kangra', 'Hamirpur']
  },
  {
    name: 'Jharkhand',
    districts: ['Ranchi', 'Jamshedpur', 'Dhanbad', 'Bokaro', 'Hazaribagh', 'Deoghar', 'Giridih', 'Dumka']
  },
  {
    name: 'Karnataka',
    districts: ['Bengaluru', 'Mysuru', 'Mangaluru', 'Hubli-Dharwad', 'Belagavi', 'Davangere', 'Ballari', 'Tumakuru', 'Shivamogga', 'Kalaburagi']
  },
  {
    name: 'Kerala',
    districts: ['Thiruvananthapuram', 'Kochi', 'Kozhikode', 'Thrissur', 'Kannur', 'Kollam', 'Palakkad', 'Alappuzha', 'Malappuram', 'Kottayam']
  },
  {
    name: 'Madhya Pradesh',
    districts: ['Bhopal', 'Indore', 'Gwalior', 'Jabalpur', 'Ujjain', 'Sagar', 'Ratlam', 'Satna', 'Rewa', 'Chhindwara']
  },
  {
    name: 'Maharashtra',
    districts: ['Mumbai', 'Pune', 'Nagpur', 'Thane', 'Nashik', 'Aurangabad', 'Solapur', 'Kolhapur', 'Amravati', 'Nanded']
  },
  {
    name: 'Manipur',
    districts: ['Imphal', 'Thoubal', 'Bishnupur', 'Churachandpur', 'Senapati']
  },
  {
    name: 'Meghalaya',
    districts: ['Shillong', 'Tura', 'Jowai', 'Nongpoh', 'Williamnagar']
  },
  {
    name: 'Mizoram',
    districts: ['Aizawl', 'Lunglei', 'Champhai', 'Serchhip', 'Kolasib']
  },
  {
    name: 'Nagaland',
    districts: ['Kohima', 'Dimapur', 'Mokokchung', 'Tuensang', 'Wokha']
  },
  {
    name: 'Odisha',
    districts: ['Bhubaneswar', 'Cuttack', 'Rourkela', 'Berhampur', 'Sambalpur', 'Puri', 'Balasore', 'Baripada', 'Bhadrak', 'Jeypore']
  },
  {
    name: 'Punjab',
    districts: ['Amritsar', 'Ludhiana', 'Jalandhar', 'Patiala', 'Bathinda', 'Mohali', 'Hoshiarpur', 'Gurdaspur', 'Firozpur', 'Fatehgarh Sahib']
  },
  {
    name: 'Rajasthan',
    districts: ['Jaipur', 'Jodhpur', 'Udaipur', 'Kota', 'Ajmer', 'Bikaner', 'Alwar', 'Bharatpur', 'Sikar', 'Nagaur']
  },
  {
    name: 'Sikkim',
    districts: ['Gangtok', 'Namchi', 'Gyalshing', 'Mangan', 'Rangpo']
  },
  {
    name: 'Tamil Nadu',
    districts: ['Chennai', 'Coimbatore', 'Madurai', 'Trichy', 'Salem', 'Tirunelveli', 'Vellore', 'Erode', 'Thoothukudi', 'Dindigul']
  },
  {
    name: 'Telangana',
    districts: ['Hyderabad', 'Warangal', 'Nizamabad', 'Khammam', 'Karimnagar', 'Ramagundam', 'Mahbubnagar', 'Nalgonda']
  },
  {
    name: 'Tripura',
    districts: ['Agartala', 'Udaipur', 'Dharmanagar', 'Kailashahar', 'Belonia']
  },
  {
    name: 'Uttar Pradesh',
    districts: ['Lucknow', 'Kanpur', 'Varanasi', 'Agra', 'Noida', 'Ghaziabad', 'Allahabad', 'Meerut', 'Bareilly', 'Aligarh', 'Gorakhpur', 'Moradabad']
  },
  {
    name: 'Uttarakhand',
    districts: ['Dehradun', 'Haridwar', 'Roorkee', 'Haldwani', 'Nainital', 'Rishikesh', 'Rudrapur', 'Kashipur']
  },
  {
    name: 'West Bengal',
    districts: ['Kolkata', 'Howrah', 'Durgapur', 'Asansol', 'Siliguri', 'Bardhaman', 'Malda', 'Kharagpur', 'Hooghly', 'Darjeeling']
  },
  {
    name: 'Jammu & Kashmir',
    districts: ['Srinagar', 'Jammu', 'Anantnag', 'Baramulla', 'Sopore', 'Udhampur', 'Kathua', 'Kupwara']
  },
  {
    name: 'Ladakh',
    districts: ['Leh', 'Kargil']
  },
  {
    name: 'Chandigarh',
    districts: ['Chandigarh']
  },
  {
    name: 'Puducherry',
    districts: ['Puducherry', 'Karaikal', 'Mahe', 'Yanam']
  }
];

// Map Nominatim state names → our statesList names (handles spelling variations)
const STATE_NAME_MAP = {
  'andhra pradesh': 'Andhra Pradesh',
  'arunachal pradesh': 'Arunachal Pradesh',
  'assam': 'Assam',
  'bihar': 'Bihar',
  'chhattisgarh': 'Chhattisgarh',
  'delhi': 'Delhi',
  'national capital territory of delhi': 'Delhi',
  'goa': 'Goa',
  'gujarat': 'Gujarat',
  'haryana': 'Haryana',
  'himachal pradesh': 'Himachal Pradesh',
  'jharkhand': 'Jharkhand',
  'karnataka': 'Karnataka',
  'kerala': 'Kerala',
  'madhya pradesh': 'Madhya Pradesh',
  'maharashtra': 'Maharashtra',
  'manipur': 'Manipur',
  'meghalaya': 'Meghalaya',
  'mizoram': 'Mizoram',
  'nagaland': 'Nagaland',
  'odisha': 'Odisha',
  'orissa': 'Odisha',
  'punjab': 'Punjab',
  'rajasthan': 'Rajasthan',
  'sikkim': 'Sikkim',
  'tamil nadu': 'Tamil Nadu',
  'telangana': 'Telangana',
  'tripura': 'Tripura',
  'uttar pradesh': 'Uttar Pradesh',
  'uttarakhand': 'Uttarakhand',
  'uttaranchal': 'Uttarakhand',
  'west bengal': 'West Bengal',
  'jammu and kashmir': 'Jammu & Kashmir',
  'jammu & kashmir': 'Jammu & Kashmir',
  'ladakh': 'Ladakh',
  'chandigarh': 'Chandigarh',
  'puducherry': 'Puducherry',
  'pondicherry': 'Puducherry',
};

function normalizeStateName(raw) {
  if (!raw) return null;
  const key = raw.trim().toLowerCase();
  return STATE_NAME_MAP[key] || null;
}

function findClosestDistrict(stateEntry, rawDistrict) {
  if (!rawDistrict || !stateEntry) return stateEntry?.districts[0] || '';
  const lower = rawDistrict.trim().toLowerCase();
  // Try exact match first
  const exact = stateEntry.districts.find(d => d.toLowerCase() === lower);
  if (exact) return exact;
  // Try includes match
  const partial = stateEntry.districts.find(d => lower.includes(d.toLowerCase()) || d.toLowerCase().includes(lower));
  if (partial) return partial;
  // Fall back to first district
  return stateEntry.districts[0];
}

export const LocationProvider = ({ children }) => {
  const [location, setLocation] = useState(() => {
    const saved = localStorage.getItem('jansahay_location');
    return saved ? JSON.parse(saved) : { state: 'Delhi', district: 'New Delhi' };
  });

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const changeLocation = (state, district) => {
    const newLoc = { state, district };
    setLocation(newLoc);
    localStorage.setItem('jansahay_location', JSON.stringify(newLoc));
  };

  const detectLocation = () => {
    if (!navigator.geolocation) {
      setErrorMsg('locationNotSupported');
      return;
    }

    setLoading(true);
    setErrorMsg('');

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          // Use OpenStreetMap Nominatim — 100% free, no API key needed
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`,
            { headers: { 'Accept-Language': 'en' } }
          );
          const data = await res.json();

          const rawState = data?.address?.state;
          const rawDistrict = data?.address?.county || data?.address?.city_district || data?.address?.city || data?.address?.town || data?.address?.suburb;

          const mappedState = normalizeStateName(rawState);

          if (mappedState) {
            const stateEntry = statesList.find(s => s.name === mappedState);
            const mappedDistrict = findClosestDistrict(stateEntry, rawDistrict);
            changeLocation(mappedState, mappedDistrict);
          } else {
            // State not in our list — save raw value gracefully
            const fallbackDistrict = rawDistrict || 'Unknown District';
            const fallbackState = rawState || 'Unknown State';
            setLocation({ state: fallbackState, district: fallbackDistrict });
            localStorage.setItem('jansahay_location', JSON.stringify({ state: fallbackState, district: fallbackDistrict }));
          }
        } catch (err) {
          console.warn('Nominatim geocoding failed:', err);
          setErrorMsg('locationDetectionFailed');
        } finally {
          setLoading(false);
        }
      },
      (error) => {
        console.warn('Geolocation error:', error);
        setErrorMsg('locationPermissionDenied');
        setLoading(false);
      },
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 0 }
    );
  };

  return (
    <LocationContext.Provider value={{ location, changeLocation, detectLocation, loading, errorMsg, statesList }}>
      {children}
    </LocationContext.Provider>
  );
};

export const useLocationContext = () => useContext(LocationContext);
