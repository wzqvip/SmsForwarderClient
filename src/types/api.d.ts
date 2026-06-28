export type Battery = {
  'health': string,
  'level': string,
  'plugged': string,
  'scale': string,
  'status': string,
  'temperature': string,
  'voltage': string
}

export type Sms = {
  'content': string,
  'date': number,
  'name': string,
  'number': string,
  'sim_id': number,
  'sub_id': number,
  'type': number,
  'typeImageId': number
}

export type CallLog = {
  'name'?: string,
  'number': string,
  'dateLong': number,
  'duration': number,
  'type': number,
  'sim_id': number
}

export type Contact = {
  'name': string,
  'phone_number': string
}

export type LocationInfo = {
  'address'?: string,
  'latitude': number,
  'longitude': number,
  'provider'?: string,
  'time': string
}

export type SimInfo = {
  'carrier_name': string,
  'country_iso': string,
  'icc_id': string,
  'number': string,
  'sim_slot_index': number,
  'subscription_id': number
}

export type ServerConfig = {
  'enable_api_battery_query': boolean,
  'enable_api_call_query': boolean,
  'enable_api_clone': boolean,
  'enable_api_contact_query': boolean,
  'enable_api_sms_query': boolean,
  'enable_api_sms_send': boolean,
  'enable_api_wol': boolean,
  'extra_device_mark'?: string,
  'extra_sim1'?: string,
  'extra_sim2'?: string,
  'sim_info_list'?: Record<string, SimInfo>
}
