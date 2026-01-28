import mongoose, { Schema, Document } from 'mongoose';

export interface IVenue {
  _id: string;
  name: string;
  address: string;
  districtId: string;
}

export interface IDistrict {
  _id: string;
  name: string;
  cityId: string;
  venues: IVenue[];
}

export interface ICity {
  _id: string;
  name: string;
  districts: IDistrict[];
}

// Venue Schema
const VenueSchema: Schema = new Schema({
  name: { type: String, required: true },
  address: { type: String, required: true },
  districtId: { type: String, required: true },
});

// District Schema
const DistrictSchema: Schema = new Schema({
  name: { type: String, required: true },
  cityId: { type: String, required: true },
  venues: [VenueSchema],
});

// City Schema
const CitySchema: Schema = new Schema({
  name: { type: String, required: true },
  districts: [DistrictSchema],
});

export const Venue = mongoose.model('Venue', VenueSchema);
export const District = mongoose.model('District', DistrictSchema);
export const City = mongoose.model<ICity & Document>('City', CitySchema);
