"use client";

import React from 'react';
import { 
  ImageIcon, AlertCircle, AlertTriangle, CheckCircle2, Lightbulb, XCircle
} from 'lucide-react';

export default function ImageSeoAnalysis() {
  const warnings = [
    { title: "Missing Layout Dimensions", desc: "Image 'google-logo.png' is missing HTML width, height attribute(s). This can cause Cumulative Layout Shift (CLS)." },
    { title: "Lazy Loading Check", desc: "Image 'google-logo.png' does not use lazy loading (loading=\"lazy\")." },
    { title: "Missing Layout Dimensions", desc: "Image 'footer-rating.png' is missing HTML width, height attribute(s). This can cause Cumulative Layout Shift (CLS)." },
    { title: "Lazy Loading Check", desc: "Image 'footer-rating.png' does not use lazy loading (loading=\"lazy\")." },
    { title: "Missing Layout Dimensions", desc: "Image 'account.jpeg' is missing HTML width, height attribute(s). This can cause Cumulative Layout Shift (CLS)." },
    { title: "Lazy Loading Check", desc: "Image 'account.jpeg' does not use lazy loading (loading=\"lazy\")." },
    { title: "Duplicate ALT Text", desc: "Image '216429234_logo2-removebg-preview.png' uses duplicate alt text: 'logo'." },
    { title: "Missing Layout Dimensions", desc: "Image '216429234_logo2-removebg-preview.png' is missing HTML width, height attribute(s). This can cause Cumulative Layout Shift (CLS)." },
    { title: "Lazy Loading Check", desc: "Image '216429234_logo2-removebg-preview.png' does not use lazy loading (loading=\"lazy\")." },
    { title: "Image Payload Size", desc: "Image '216429234_logo2-removebg-preview.png' has a large file size (140.6 KB). Aim to compress images under 100 KB." },
    { title: "Duplicate ALT Text", desc: "Image 'home-google-review.png' uses duplicate alt text: 'google-review'." },
    { title: "Missing Layout Dimensions", desc: "Image 'home-google-review.png' is missing HTML width, height attribute(s). This can cause Cumulative Layout Shift (CLS)." },
    { title: "Lazy Loading Check", desc: "Image 'home-google-review.png' does not use lazy loading (loading=\"lazy\")." },
    { title: "Duplicate ALT Text", desc: "Image '10-a.png' uses duplicate alt text: 'google-review'." },
    { title: "Missing Layout Dimensions", desc: "Image '10-a.png' is missing HTML width, height attribute(s). This can cause Cumulative Layout Shift (CLS)." },
    { title: "Lazy Loading Check", desc: "Image '10-a.png' does not use lazy loading (loading=\"lazy\")." },
    { title: "Duplicate ALT Text", desc: "Image 'developer.png' uses duplicate alt text: 'mobile'." },
    { title: "Missing Layout Dimensions", desc: "Image 'developer.png' is missing HTML width, height attribute(s). This can cause Cumulative Layout Shift (CLS)." },
    { title: "Lazy Loading Check", desc: "Image 'developer.png' does not use lazy loading (loading=\"lazy\")." },
    { title: "Duplicate ALT Text", desc: "Image 'computer.png' uses duplicate alt text: 'mobile'." },
    { title: "Missing Layout Dimensions", desc: "Image 'computer.png' is missing HTML width, height attribute(s). This can cause Cumulative Layout Shift (CLS)." },
    { title: "Lazy Loading Check", desc: "Image 'computer.png' does not use lazy loading (loading=\"lazy\")." },
    { title: "Duplicate ALT Text", desc: "Image 'shopping.png' uses duplicate alt text: 'mobile'." },
    { title: "Missing Layout Dimensions", desc: "Image 'shopping.png' is missing HTML width, height attribute(s). This can cause Cumulative Layout Shift (CLS)." },
    { title: "Lazy Loading Check", desc: "Image 'shopping.png' does not use lazy loading (loading=\"lazy\")." },
    { title: "Duplicate ALT Text", desc: "Image 'social-marketing.png' uses duplicate alt text: 'mobile'." },
    { title: "Missing Layout Dimensions", desc: "Image 'social-marketing.png' is missing HTML width, height attribute(s). This can cause Cumulative Layout Shift (CLS)." },
    { title: "Lazy Loading Check", desc: "Image 'social-marketing.png' does not use lazy loading (loading=\"lazy\")." },
    { title: "Missing Layout Dimensions", desc: "Image 'web2.webp' is missing HTML width, height attribute(s). This can cause Cumulative Layout Shift (CLS)." },
    { title: "Lazy Loading Check", desc: "Image 'web2.webp' does not use lazy loading (loading=\"lazy\")." },
    { title: "Duplicate ALT Text", desc: "Image 'new-graphic-img001.png' uses duplicate alt text: 'main-picture'." },
    { title: "Missing Layout Dimensions", desc: "Image 'new-graphic-img001.png' is missing HTML width, height attribute(s). This can cause Cumulative Layout Shift (CLS)." },
    { title: "Lazy Loading Check", desc: "Image 'new-graphic-img001.png' does not use lazy loading (loading=\"lazy\")." },
    { title: "Duplicate ALT Text", desc: "Image 'new-graphic-social-icon01.png' uses duplicate alt text: 'icon1'." },
    { title: "Missing Layout Dimensions", desc: "Image 'new-graphic-social-icon01.png' is missing HTML width, height attribute(s). This can cause Cumulative Layout Shift (CLS)." },
    { title: "Lazy Loading Check", desc: "Image 'new-graphic-social-icon01.png' does not use lazy loading (loading=\"lazy\")." },
    { title: "Duplicate ALT Text", desc: "Image 'new-graphic-social-icon02.png' uses duplicate alt text: 'icon1'." },
    { title: "Missing Layout Dimensions", desc: "Image 'new-graphic-social-icon02.png' is missing HTML width, height attribute(s). This can cause Cumulative Layout Shift (CLS)." },
    { title: "Lazy Loading Check", desc: "Image 'new-graphic-social-icon02.png' does not use lazy loading (loading=\"lazy\")." },
    { title: "Duplicate ALT Text", desc: "Image 'new-graphic-social-icon03.png' uses duplicate alt text: 'icon1'." },
    { title: "Missing Layout Dimensions", desc: "Image 'new-graphic-social-icon03.png' is missing HTML width, height attribute(s). This can cause Cumulative Layout Shift (CLS)." },
    { title: "Lazy Loading Check", desc: "Image 'new-graphic-social-icon03.png' does not use lazy loading (loading=\"lazy\")." },
    { title: "Duplicate ALT Text", desc: "Image 'new-graphic-social-icon04.png' uses duplicate alt text: 'icon1'." },
    { title: "Missing Layout Dimensions", desc: "Image 'new-graphic-social-icon04.png' is missing HTML width, height attribute(s). This can cause Cumulative Layout Shift (CLS)." },
    { title: "Lazy Loading Check", desc: "Image 'new-graphic-social-icon04.png' does not use lazy loading (loading=\"lazy\")." },
    { title: "Duplicate ALT Text", desc: "Image 'new-graphic-social-icon05.png' uses duplicate alt text: 'icon1'." },
    { title: "Missing Layout Dimensions", desc: "Image 'new-graphic-social-icon05.png' is missing HTML width, height attribute(s). This can cause Cumulative Layout Shift (CLS)." },
    { title: "Lazy Loading Check", desc: "Image 'new-graphic-social-icon05.png' does not use lazy loading (loading=\"lazy\")." },
    { title: "Duplicate ALT Text", desc: "Image 'new-graphic-social-icon06.png' uses duplicate alt text: 'icon1'." },
    { title: "Missing Layout Dimensions", desc: "Image 'new-graphic-social-icon06.png' is missing HTML width, height attribute(s). This can cause Cumulative Layout Shift (CLS)." },
    { title: "Lazy Loading Check", desc: "Image 'new-graphic-social-icon06.png' does not use lazy loading (loading=\"lazy\")." },
    { title: "Missing Layout Dimensions", desc: "Image 'new-dott-line-600x806.png' is missing HTML width, height attribute(s). This can cause Cumulative Layout Shift (CLS)." },
    { title: "Lazy Loading Check", desc: "Image 'new-dott-line-600x806.png' does not use lazy loading (loading=\"lazy\")." },
    { title: "Duplicate ALT Text", desc: "Image 'new-graphic-img002.png' uses duplicate alt text: 'main-picture'." },
    { title: "Missing Layout Dimensions", desc: "Image 'new-graphic-img002.png' is missing HTML width, height attribute(s). This can cause Cumulative Layout Shift (CLS)." },
    { title: "Lazy Loading Check", desc: "Image 'new-graphic-img002.png' does not use lazy loading (loading=\"lazy\")." },
    { title: "Duplicate ALT Text", desc: "Image 'new-graphic-social-icon01.png' uses duplicate alt text: 'icon1'." },
    { title: "Missing Layout Dimensions", desc: "Image 'new-graphic-social-icon01.png' is missing HTML width, height attribute(s). This can cause Cumulative Layout Shift (CLS)." },
    { title: "Lazy Loading Check", desc: "Image 'new-graphic-social-icon01.png' does not use lazy loading (loading=\"lazy\")." },
    { title: "Duplicate ALT Text", desc: "Image 'new-graphic-social-icon02.png' uses duplicate alt text: 'icon1'." },
    { title: "Missing Layout Dimensions", desc: "Image 'new-graphic-social-icon02.png' is missing HTML width, height attribute(s). This can cause Cumulative Layout Shift (CLS)." },
    { title: "Lazy Loading Check", desc: "Image 'new-graphic-social-icon02.png' does not use lazy loading (loading=\"lazy\")." },
    { title: "Duplicate ALT Text", desc: "Image 'new-graphic-social-icon03.png' uses duplicate alt text: 'icon1'." },
    { title: "Missing Layout Dimensions", desc: "Image 'new-graphic-social-icon03.png' is missing HTML width, height attribute(s). This can cause Cumulative Layout Shift (CLS)." },
    { title: "Lazy Loading Check", desc: "Image 'new-graphic-social-icon03.png' does not use lazy loading (loading=\"lazy\")." },
    { title: "Duplicate ALT Text", desc: "Image 'new-graphic-social-icon04.png' uses duplicate alt text: 'icon1'." },
    { title: "Missing Layout Dimensions", desc: "Image 'new-graphic-social-icon04.png' is missing HTML width, height attribute(s). This can cause Cumulative Layout Shift (CLS)." },
    { title: "Lazy Loading Check", desc: "Image 'new-graphic-social-icon04.png' does not use lazy loading (loading=\"lazy\")." },
    { title: "Duplicate ALT Text", desc: "Image 'new-graphic-social-icon05.png' uses duplicate alt text: 'icon1'." },
    { title: "Missing Layout Dimensions", desc: "Image 'new-graphic-social-icon05.png' is missing HTML width, height attribute(s). This can cause Cumulative Layout Shift (CLS)." },
    { title: "Lazy Loading Check", desc: "Image 'new-graphic-social-icon05.png' does not use lazy loading (loading=\"lazy\")." },
    { title: "Duplicate ALT Text", desc: "Image 'new-graphic-social-icon06.png' uses duplicate alt text: 'icon1'." },
    { title: "Missing Layout Dimensions", desc: "Image 'new-graphic-social-icon06.png' is missing HTML width, height attribute(s). This can cause Cumulative Layout Shift (CLS)." },
    { title: "Lazy Loading Check", desc: "Image 'new-graphic-social-icon06.png' does not use lazy loading (loading=\"lazy\")." },
    { title: "Duplicate ALT Text", desc: "Image 'instreamatic.png' uses duplicate alt text: 'mobile'." },
    { title: "Missing Layout Dimensions", desc: "Image 'instreamatic.png' is missing HTML width, height attribute(s). This can cause Cumulative Layout Shift (CLS)." },
    { title: "Lazy Loading Check", desc: "Image 'instreamatic.png' does not use lazy loading (loading=\"lazy\")." },
    { title: "Duplicate ALT Text", desc: "Image 'network.png' uses duplicate alt text: 'Industries'." },
    { title: "Missing Layout Dimensions", desc: "Image 'network.png' is missing HTML width, height attribute(s). This can cause Cumulative Layout Shift (CLS)." },
    { title: "Lazy Loading Check", desc: "Image 'network.png' does not use lazy loading (loading=\"lazy\")." },
    { title: "Duplicate ALT Text", desc: "Image 'manufacturing.png' uses duplicate alt text: 'Industries'." },
    { title: "Missing Layout Dimensions", desc: "Image 'manufacturing.png' is missing HTML width, height attribute(s). This can cause Cumulative Layout Shift (CLS)." },
    { title: "Lazy Loading Check", desc: "Image 'manufacturing.png' does not use lazy loading (loading=\"lazy\")." },
    { title: "Duplicate ALT Text", desc: "Image 'laptop.png' uses duplicate alt text: 'Industries'." },
    { title: "Missing Layout Dimensions", desc: "Image 'laptop.png' is missing HTML width, height attribute(s). This can cause Cumulative Layout Shift (CLS)." },
    { title: "Lazy Loading Check", desc: "Image 'laptop.png' does not use lazy loading (loading=\"lazy\")." },
    { title: "Duplicate ALT Text", desc: "Image 'dental-insurance.png' uses duplicate alt text: 'Industries'." },
    { title: "Missing Layout Dimensions", desc: "Image 'dental-insurance.png' is missing HTML width, height attribute(s). This can cause Cumulative Layout Shift (CLS)." },
    { title: "Lazy Loading Check", desc: "Image 'dental-insurance.png' does not use lazy loading (loading=\"lazy\")." },
    { title: "Duplicate ALT Text", desc: "Image 'hotel.png' uses duplicate alt text: 'Industries'." },
    { title: "Missing Layout Dimensions", desc: "Image 'hotel.png' is missing HTML width, height attribute(s). This can cause Cumulative Layout Shift (CLS)." },
    { title: "Lazy Loading Check", desc: "Image 'hotel.png' does not use lazy loading (loading=\"lazy\")." },
    { title: "Duplicate ALT Text", desc: "Image 'enterprise.png' uses duplicate alt text: 'Industries'." },
    { title: "Missing Layout Dimensions", desc: "Image 'enterprise.png' is missing HTML width, height attribute(s). This can cause Cumulative Layout Shift (CLS)." },
    { title: "Lazy Loading Check", desc: "Image 'enterprise.png' does not use lazy loading (loading=\"lazy\")." },
    { title: "Duplicate ALT Text", desc: "Image 'education.png' uses duplicate alt text: 'Industries'." },
    { title: "Missing Layout Dimensions", desc: "Image 'education.png' is missing HTML width, height attribute(s). This can cause Cumulative Layout Shift (CLS)." },
    { title: "Lazy Loading Check", desc: "Image 'education.png' does not use lazy loading (loading=\"lazy\")." },
    { title: "Duplicate ALT Text", desc: "Image 'labor.png' uses duplicate alt text: 'Industries'." },
    { title: "Missing Layout Dimensions", desc: "Image 'labor.png' is missing HTML width, height attribute(s). This can cause Cumulative Layout Shift (CLS)." },
    { title: "Lazy Loading Check", desc: "Image 'labor.png' does not use lazy loading (loading=\"lazy\")." },
    { title: "Duplicate ALT Text", desc: "Image 'global.png' uses duplicate alt text: 'Industries'." },
    { title: "Missing Layout Dimensions", desc: "Image 'global.png' is missing HTML width, height attribute(s). This can cause Cumulative Layout Shift (CLS)." },
    { title: "Lazy Loading Check", desc: "Image 'global.png' does not use lazy loading (loading=\"lazy\")." },
    { title: "Duplicate ALT Text", desc: "Image 'tickets.png' uses duplicate alt text: 'Industries'." },
    { title: "Missing Layout Dimensions", desc: "Image 'tickets.png' is missing HTML width, height attribute(s). This can cause Cumulative Layout Shift (CLS)." },
    { title: "Lazy Loading Check", desc: "Image 'tickets.png' does not use lazy loading (loading=\"lazy\")." },
    { title: "Duplicate ALT Text", desc: "Image 'salad.png' uses duplicate alt text: 'Industries'." },
    { title: "Missing Layout Dimensions", desc: "Image 'salad.png' is missing HTML width, height attribute(s). This can cause Cumulative Layout Shift (CLS)." },
    { title: "Lazy Loading Check", desc: "Image 'salad.png' does not use lazy loading (loading=\"lazy\")." },
    { title: "Duplicate ALT Text", desc: "Image 'interview.png' uses duplicate alt text: 'Industries'." },
    { title: "Missing Layout Dimensions", desc: "Image 'interview.png' is missing HTML width, height attribute(s). This can cause Cumulative Layout Shift (CLS)." },
    { title: "Lazy Loading Check", desc: "Image 'interview.png' does not use lazy loading (loading=\"lazy\")." },
    { title: "Duplicate ALT Text", desc: "Image 'circ1.png' uses duplicate alt text: 'pic'." },
    { title: "Missing Layout Dimensions", desc: "Image 'circ1.png' is missing HTML width, height attribute(s). This can cause Cumulative Layout Shift (CLS)." },
    { title: "Lazy Loading Check", desc: "Image 'circ1.png' does not use lazy loading (loading=\"lazy\")." },
    { title: "Duplicate ALT Text", desc: "Image 'circ2.png' uses duplicate alt text: 'pic'." },
    { title: "Missing Layout Dimensions", desc: "Image 'circ2.png' is missing HTML width, height attribute(s). This can cause Cumulative Layout Shift (CLS)." },
    { title: "Lazy Loading Check", desc: "Image 'circ2.png' does not use lazy loading (loading=\"lazy\")." },
    { title: "Duplicate ALT Text", desc: "Image '767837625_utkarsh.webp' uses duplicate alt text: 'Client'." },
    { title: "Missing Layout Dimensions", desc: "Image '767837625_utkarsh.webp' is missing HTML width, height attribute(s). This can cause Cumulative Layout Shift (CLS)." },
    { title: "Lazy Loading Check", desc: "Image '767837625_utkarsh.webp' does not use lazy loading (loading=\"lazy\")." },
    { title: "Duplicate ALT Text", desc: "Image '549959912_urbangreens.jpg' uses duplicate alt text: 'Client'." },
    { title: "Missing Layout Dimensions", desc: "Image '549959912_urbangreens.jpg' is missing HTML width, height attribute(s). This can cause Cumulative Layout Shift (CLS)." },
    { title: "Lazy Loading Check", desc: "Image '549959912_urbangreens.jpg' does not use lazy loading (loading=\"lazy\")." },
    { title: "Duplicate ALT Text", desc: "Image '591925967_msme.png' uses duplicate alt text: 'Client'." },
    { title: "Missing Layout Dimensions", desc: "Image '591925967_msme.png' is missing HTML width, height attribute(s). This can cause Cumulative Layout Shift (CLS)." },
    { title: "Lazy Loading Check", desc: "Image '591925967_msme.png' does not use lazy loading (loading=\"lazy\")." },
    { title: "Duplicate ALT Text", desc: "Image '318590249_amrit.png' uses duplicate alt text: 'Client'." },
    { title: "Missing Layout Dimensions", desc: "Image '318590249_amrit.png' is missing HTML width, height attribute(s). This can cause Cumulative Layout Shift (CLS)." },
    { title: "Lazy Loading Check", desc: "Image '318590249_amrit.png' does not use lazy loading (loading=\"lazy\")." },
    { title: "Duplicate ALT Text", desc: "Image '726700482_hallmark.png' uses duplicate alt text: 'Client'." },
    { title: "Missing Layout Dimensions", desc: "Image '726700482_hallmark.png' is missing HTML width, height attribute(s). This can cause Cumulative Layout Shift (CLS)." },
    { title: "Lazy Loading Check", desc: "Image '726700482_hallmark.png' does not use lazy loading (loading=\"lazy\")." },
    { title: "Duplicate ALT Text", desc: "Image '332486696_arc.png' uses duplicate alt text: 'Client'." },
    { title: "Missing Layout Dimensions", desc: "Image '332486696_arc.png' is missing HTML width, height attribute(s). This can cause Cumulative Layout Shift (CLS)." },
    { title: "Lazy Loading Check", desc: "Image '332486696_arc.png' does not use lazy loading (loading=\"lazy\")." },
    { title: "Duplicate ALT Text", desc: "Image '549413611_debipranam.png' uses duplicate alt text: 'Client'." },
    { title: "Missing Layout Dimensions", desc: "Image '549413611_debipranam.png' is missing HTML width, height attribute(s). This can cause Cumulative Layout Shift (CLS)." },
    { title: "Lazy Loading Check", desc: "Image '549413611_debipranam.png' does not use lazy loading (loading=\"lazy\")." },
    { title: "Duplicate ALT Text", desc: "Image '341286851_sec.png' uses duplicate alt text: 'Client'." },
    { title: "Missing Layout Dimensions", desc: "Image '341286851_sec.png' is missing HTML width, height attribute(s). This can cause Cumulative Layout Shift (CLS)." },
    { title: "Lazy Loading Check", desc: "Image '341286851_sec.png' does not use lazy loading (loading=\"lazy\")." },
    { title: "Duplicate ALT Text", desc: "Image '158945946_ssu.png' uses duplicate alt text: 'Client'." },
    { title: "Missing Layout Dimensions", desc: "Image '158945946_ssu.png' is missing HTML width, height attribute(s). This can cause Cumulative Layout Shift (CLS)." },
    { title: "Lazy Loading Check", desc: "Image '158945946_ssu.png' does not use lazy loading (loading=\"lazy\")." },
    { title: "Duplicate ALT Text", desc: "Image '805827641_DPS-LOGO_PNG-WITH-BODER.png' uses duplicate alt text: 'Client'." },
    { title: "Missing Layout Dimensions", desc: "Image '805827641_DPS-LOGO_PNG-WITH-BODER.png' is missing HTML width, height attribute(s). This can cause Cumulative Layout Shift (CLS)." },
    { title: "Lazy Loading Check", desc: "Image '805827641_DPS-LOGO_PNG-WITH-BODER.png' does not use lazy loading (loading=\"lazy\")." },
    { title: "Duplicate ALT Text", desc: "Image '303710841_bhaskarsriniketan.png' uses duplicate alt text: 'Client'." },
    { title: "Missing Layout Dimensions", desc: "Image '303710841_bhaskarsriniketan.png' is missing HTML width, height attribute(s). This can cause Cumulative Layout Shift (CLS)." },
    { title: "Lazy Loading Check", desc: "Image '303710841_bhaskarsriniketan.png' does not use lazy loading (loading=\"lazy\")." },
    { title: "Duplicate ALT Text", desc: "Image '690820486_sahatextile.png' uses duplicate alt text: 'Client'." },
    { title: "Missing Layout Dimensions", desc: "Image '690820486_sahatextile.png' is missing HTML width, height attribute(s). This can cause Cumulative Layout Shift (CLS)." },
    { title: "Lazy Loading Check", desc: "Image '690820486_sahatextile.png' does not use lazy loading (loading=\"lazy\")." },
    { title: "Duplicate ALT Text", desc: "Image '860250568_sugam.png' uses duplicate alt text: 'Client'." },
    { title: "Missing Layout Dimensions", desc: "Image '860250568_sugam.png' is missing HTML width, height attribute(s). This can cause Cumulative Layout Shift (CLS)." },
    { title: "Lazy Loading Check", desc: "Image '860250568_sugam.png' does not use lazy loading (loading=\"lazy\")." },
    { title: "Duplicate ALT Text", desc: "Image '211495644_svist_only_logo.png' uses duplicate alt text: 'Client'." },
    { title: "Missing Layout Dimensions", desc: "Image '211495644_svist_only_logo.png' is missing HTML width, height attribute(s). This can cause Cumulative Layout Shift (CLS)." },
    { title: "Lazy Loading Check", desc: "Image '211495644_svist_only_logo.png' does not use lazy loading (loading=\"lazy\")." },
    { title: "Duplicate ALT Text", desc: "Image '133197224_Intelli_Logo.png' uses duplicate alt text: 'Client'." },
    { title: "Missing Layout Dimensions", desc: "Image '133197224_Intelli_Logo.png' is missing HTML width, height attribute(s). This can cause Cumulative Layout Shift (CLS)." },
    { title: "Lazy Loading Check", desc: "Image '133197224_Intelli_Logo.png' does not use lazy loading (loading=\"lazy\")." },
    { title: "Duplicate ALT Text", desc: "Image '270367607_gfc.png' uses duplicate alt text: 'Client'." },
    { title: "Missing Layout Dimensions", desc: "Image '270367607_gfc.png' is missing HTML width, height attribute(s). This can cause Cumulative Layout Shift (CLS)." },
    { title: "Lazy Loading Check", desc: "Image '270367607_gfc.png' does not use lazy loading (loading=\"lazy\")." },
    { title: "Duplicate ALT Text", desc: "Image '810634560_megacity.png' uses duplicate alt text: 'Client'." },
    { title: "Missing Layout Dimensions", desc: "Image '810634560_megacity.png' is missing HTML width, height attribute(s). This can cause Cumulative Layout Shift (CLS)." },
    { title: "Lazy Loading Check", desc: "Image '810634560_megacity.png' does not use lazy loading (loading=\"lazy\")." },
    { title: "Duplicate ALT Text", desc: "Image '694728750_logo.png' uses duplicate alt text: 'Client'." },
    { title: "Missing Layout Dimensions", desc: "Image '694728750_logo.png' is missing HTML width, height attribute(s). This can cause Cumulative Layout Shift (CLS)." },
    { title: "Lazy Loading Check", desc: "Image '694728750_logo.png' does not use lazy loading (loading=\"lazy\")." },
    { title: "Duplicate ALT Text", desc: "Image '144653162_Layer_2.png' uses duplicate alt text: 'Client'." },
    { title: "Missing Layout Dimensions", desc: "Image '144653162_Layer_2.png' is missing HTML width, height attribute(s). This can cause Cumulative Layout Shift (CLS)." },
    { title: "Lazy Loading Check", desc: "Image '144653162_Layer_2.png' does not use lazy loading (loading=\"lazy\")." },
    { title: "Duplicate ALT Text", desc: "Image '293447368_cake-mania.png' uses duplicate alt text: 'Client'." },
    { title: "Missing Layout Dimensions", desc: "Image '293447368_cake-mania.png' is missing HTML width, height attribute(s). This can cause Cumulative Layout Shift (CLS)." },
    { title: "Lazy Loading Check", desc: "Image '293447368_cake-mania.png' does not use lazy loading (loading=\"lazy\")." },
    { title: "Duplicate ALT Text", desc: "Image '753263092_dalmia-health.png' uses duplicate alt text: 'Client'." },
    { title: "Missing Layout Dimensions", desc: "Image '753263092_dalmia-health.png' is missing HTML width, height attribute(s). This can cause Cumulative Layout Shift (CLS)." },
    { title: "Lazy Loading Check", desc: "Image '753263092_dalmia-health.png' does not use lazy loading (loading=\"lazy\")." },
    { title: "Duplicate ALT Text", desc: "Image '603986980_neptune.png' uses duplicate alt text: 'Client'." },
    { title: "Missing Layout Dimensions", desc: "Image '603986980_neptune.png' is missing HTML width, height attribute(s). This can cause Cumulative Layout Shift (CLS)." },
    { title: "Lazy Loading Check", desc: "Image '603986980_neptune.png' does not use lazy loading (loading=\"lazy\")." },
    { title: "Duplicate ALT Text", desc: "Image '425230290_newbyteas.png' uses duplicate alt text: 'Client'." },
    { title: "Missing Layout Dimensions", desc: "Image '425230290_newbyteas.png' is missing HTML width, height attribute(s). This can cause Cumulative Layout Shift (CLS)." },
    { title: "Lazy Loading Check", desc: "Image '425230290_newbyteas.png' does not use lazy loading (loading=\"lazy\")." },
    { title: "Duplicate ALT Text", desc: "Image '272561967_rajwadagroup.png' uses duplicate alt text: 'Client'." },
    { title: "Missing Layout Dimensions", desc: "Image '272561967_rajwadagroup.png' is missing HTML width, height attribute(s). This can cause Cumulative Layout Shift (CLS)." },
    { title: "Lazy Loading Check", desc: "Image '272561967_rajwadagroup.png' does not use lazy loading (loading=\"lazy\")." },
    { title: "Duplicate ALT Text", desc: "Image '130468131_pansari.png' uses duplicate alt text: 'Client'." },
    { title: "Missing Layout Dimensions", desc: "Image '130468131_pansari.png' is missing HTML width, height attribute(s). This can cause Cumulative Layout Shift (CLS)." },
    { title: "Lazy Loading Check", desc: "Image '130468131_pansari.png' does not use lazy loading (loading=\"lazy\")." },
    { title: "Duplicate ALT Text", desc: "Image '962103383_little-millennium.png' uses duplicate alt text: 'Client'." },
    { title: "Missing Layout Dimensions", desc: "Image '962103383_little-millennium.png' is missing HTML width, height attribute(s). This can cause Cumulative Layout Shift (CLS)." },
    { title: "Lazy Loading Check", desc: "Image '962103383_little-millennium.png' does not use lazy loading (loading=\"lazy\")." },
    { title: "Duplicate ALT Text", desc: "Image '216429234_logo2-removebg-preview.png' uses duplicate alt text: 'logo'." },
    { title: "Missing Layout Dimensions", desc: "Image '216429234_logo2-removebg-preview.png' is missing HTML width, height attribute(s). This can cause Cumulative Layout Shift (CLS)." },
    { title: "Lazy Loading Check", desc: "Image '216429234_logo2-removebg-preview.png' does not use lazy loading (loading=\"lazy\")." },
    { title: "Image Payload Size", desc: "Image '216429234_logo2-removebg-preview.png' has a large file size (140.6 KB). Aim to compress images under 100 KB." },
    { title: "Missing Layout Dimensions", desc: "Image 'subs.png' is missing HTML width, height attribute(s). This can cause Cumulative Layout Shift (CLS)." }
  ];

  const passedChecks = [
    {
      title: 'Image Optimized',
      desc: "Image 'new-quote-start.png' successfully passed all Alt, size, formatting, lazy loading, and layout dimensions audits."
    },
    {
      title: 'Image Optimized',
      desc: "Image 'new-quote-end.png' successfully passed all Alt, size, formatting, lazy loading, and layout dimensions audits."
    }
  ];

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
      
      {/* Header Info */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 mb-6">
        <div className="flex items-center gap-2">
          <ImageIcon className="w-5 h-5 text-indigo-500" />
          <h2 className="text-lg font-bold text-slate-800 tracking-tight uppercase text-[13px]">
            Image SEO Analysis
          </h2>
        </div>
        
        <div className="flex items-center gap-2">
          <span className="text-[12px] font-medium text-slate-400">Image SEO Score:</span>
          <span className="px-3 py-1 rounded-full bg-orange-50 border border-orange-100 text-orange-600 font-bold text-[13px]">
            71/100
          </span>
        </div>
      </div>

      {/* Summary Stat Blocks */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {/* Total Images */}
        <div className="bg-purple-50/40 border border-purple-100 rounded-xl p-4 flex flex-col items-center justify-center">
          <span className="text-2xl font-bold text-purple-600">71</span>
          <span className="text-[10px] font-bold text-purple-500 uppercase tracking-wider mt-0.5">Total Images</span>
        </div>

        {/* Missing Alt */}
        <div className="bg-amber-50/40 border border-amber-100 rounded-xl p-4 flex flex-col items-center justify-center">
          <span className="text-2xl font-bold text-amber-600">0</span>
          <span className="text-[10px] font-bold text-amber-500 uppercase tracking-wider mt-0.5">Missing Alt</span>
        </div>

        {/* Large Images */}
        <div className="bg-sky-50/40 border border-sky-100 rounded-xl p-4 flex flex-col items-center justify-center">
          <span className="text-2xl font-bold text-sky-600">2</span>
          <span className="text-[10px] font-bold text-sky-500 uppercase tracking-wider mt-0.5">Large Images</span>
        </div>

        {/* Broken Images */}
        <div className="bg-rose-50/40 border border-rose-100 rounded-xl p-4 flex flex-col items-center justify-center">
          <span className="text-2xl font-bold text-rose-600">0</span>
          <span className="text-[10px] font-bold text-rose-500 uppercase tracking-wider mt-0.5">Broken Images</span>
        </div>
      </div>

      {/* Image Optimization Suggestions */}
      <div className="bg-amber-50/20 border border-amber-100 rounded-xl p-5 mb-6">
        <div className="flex items-center gap-2 mb-3">
          <Lightbulb className="w-5 h-5 text-amber-500 shrink-0" />
          <h4 className="text-sm font-bold text-slate-800">Image Optimization Suggestions</h4>
        </div>
        <ul className="space-y-2 text-[13px] font-semibold text-slate-600 pl-7 list-disc leading-relaxed">
          <li>Compress the 2 oversized images (&gt;100 KB) using WebP/AVIF to improve page speed and reduce payload sizes.</li>
          <li>Implement lazy-loading (loading="lazy") on 68 offscreen image tags to defer non-critical render payloads.</li>
          <li>Add width and height properties to the 69 image tags to specify explicit layout dimensions and prevent CLS.</li>
        </ul>
      </div>

      {/* Three Column Details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Critical Column */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
            <XCircle className="w-5 h-5 text-slate-900 shrink-0" />
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Critical Issues</h3>
          </div>
          <p className="text-sm text-slate-400 font-medium py-2">No critical checks.</p>
        </div>

        {/* Warnings Column */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
            <AlertTriangle className="w-5 h-5 text-slate-900 shrink-0" />
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Warnings</h3>
          </div>
          <div className="max-h-[350px] overflow-y-auto space-y-3 pr-2 scrollbar-thin">
            {warnings.map((issue, i) => (
              <div key={i} className="bg-amber-50/20 border border-amber-100 rounded-xl p-4 flex items-start gap-3">
                <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <h4 className="font-bold text-slate-800 text-xs">{issue.title}</h4>
                  <p className="text-[12px] text-slate-500 leading-relaxed font-medium">{issue.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Passed Column */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
            <CheckCircle2 className="w-5 h-5 text-slate-900 shrink-0" />
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Passed Checks</h3>
          </div>
          <div className="max-h-[350px] overflow-y-auto space-y-3 pr-2 scrollbar-thin">
            {passedChecks.map((check, i) => (
              <div key={i} className="bg-emerald-50/20 border border-emerald-100 rounded-xl p-4 flex items-start gap-3">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <h4 className="font-bold text-slate-800 text-xs">{check.title}</h4>
                  <p className="text-[12px] text-slate-500 leading-relaxed font-medium">{check.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
}
