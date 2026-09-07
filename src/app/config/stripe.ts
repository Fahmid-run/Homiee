import Stripe from "stripe";
import { configs } from ".";

export const stripe = new Stripe(configs.STRIPE_SECRET_KEY as string);
