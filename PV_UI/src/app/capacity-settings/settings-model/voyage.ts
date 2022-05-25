export class Voyage {
  public vessels: Array<Vessel> = [];

  public setVessels(data) {

    data.forEach(item => {
      item.ports?.forEach(port => {
        port.isDefault = false;
        let tlist = new ThresholdList;
        if (port.thresholdList.length) {
          port.thresholdList.forEach(threshold => {
            if (threshold.cargoType.toLowerCase() === 'dry' && threshold.color.toLowerCase() === 'green') {
              tlist.dry_green = threshold;
            } else if (threshold.cargoType.toLowerCase() === 'dry' && threshold.color.toLowerCase() === 'yellow') {
              tlist.dry_yellow = threshold;
            } else if (threshold.cargoType.toLowerCase() === 'dry' && threshold.color.toLowerCase() === 'red') {
              tlist.dry_red = threshold;
            } else if (threshold.cargoType.toLowerCase() === 'breakbulk' && threshold.color.toLowerCase() === 'green') {
              tlist.bb_green = threshold;
            } else if (threshold.cargoType.toLowerCase() === 'breakbulk' && threshold.color.toLowerCase() === 'yellow') {
              tlist.bb_yellow = threshold;
            } else if (threshold.cargoType.toLowerCase() === 'breakbulk' && threshold.color.toLowerCase() === 'red') {
              tlist.bb_red = threshold;
            } else if (threshold.cargoType.toLowerCase() === 'reefer' && threshold.color.toLowerCase() === 'green') {
              tlist.reefer_green = threshold;
            } else if (threshold.cargoType.toLowerCase() === 'reefer' && threshold.color.toLowerCase() === 'yellow') {
              tlist.reefer_yellow = threshold;
            } else if (threshold.cargoType.toLowerCase() === 'reefer' && threshold.color.toLowerCase() === 'red') {
              tlist.reefer_red = threshold;
            } else if (threshold.cargoType.toLowerCase() === 'empties' && threshold.color.toLowerCase() === 'green') {
              tlist.empty_green = threshold;
            } else if (threshold.cargoType.toLowerCase() === 'empties' && threshold.color.toLowerCase() === 'yellow') {
              tlist.empty_yellow = threshold;
            } else if (threshold.cargoType.toLowerCase() === 'empties' && threshold.color.toLowerCase() === 'red') {
              tlist.empty_red = threshold;
            }
          });
          port.thresholdList = tlist;
        } else {
          let etList = new ThresholdList;
          etList.dry_green = this.setThreshold('dry', 'green');
          etList.dry_yellow = this.setThreshold('dry', 'yellow');
          etList.dry_red = this.setThreshold('dry', 'red');
          etList.bb_green = this.setThreshold('breakbulk', 'green');
          etList.bb_yellow = this.setThreshold('breakbulk', 'yellow');
          etList.bb_red = this.setThreshold('breakbulk', 'red');
          etList.reefer_green = this.setThreshold('reefer', 'green');
          etList.reefer_yellow = this.setThreshold('reefer', 'yellow');
          etList.reefer_red = this.setThreshold('reefer', 'red');
          etList.empty_green = this.setThreshold('empties', 'green');
          etList.empty_yellow = this.setThreshold('empties', 'yellow');
          etList.empty_red = this.setThreshold('empties', 'red');
          port.thresholdList = etList;
        }

      });
    })

    this.vessels = data;

  }

  public setThreshold(t, c) {
    let titem = {
      cargoType: t,
      color: c,
      unit: t === 'breakbulk' ? "R/T" : 'TEU',
      min: c === 'green' ? 0 : '',
      max: c === 'red' ? 0 : '',
    }
    return titem;
  }

}

class Vessel {
  public vessel_code;
  public vessel_name;
  public voyage_number;
  public direction;
  public service_code;
  public service_name;
  public ports: Array<Port>;
  public vvl_utilisation: VvlUtilization;
}

class Port {
  public port_code;
  public port_name;
  public totalTeu;
  public totalMton;
  public rt;
  public ETA;
  public ETD;
  public port_utilisation_load: PortUtilization;
  public thresholdList: ThresholdList;
  public isDefault = false;
}

class ThresholdList {
  public dry_red;
  public dry_yellow;
  public dry_green;
  public bb_red;
  public bb_yellow;
  public bb_green;
  public reefer_red;
  public reefer_yellow;
  public reefer_green;
  public empty_red;
  public empty_yellow;
  public empty_green;

}



class PortUtilization {
  public port_load_bkg_dry_teu;
  public port_load_bkg_dry_tonne;
  public port_load_bkg_reefer_teu;
  public port_load_bkg_reefer_tonne;
  public port_load_bkg_empty_teu;
  public port_load_bkg_empty_tonne;
  public port_load_bkg_bb_rt;
  public port_load_bkg_bb_tonne;
}


class VvlUtilization {
  public ops_allocation: OpsAllocation;
  public act_booking: ActBooking;
}

class OpsAllocation {
  public vvl_alloc_ops_teu;
  public vvl_alloc_slot_teu;
  public vvl_alloc_bb_rt;
  public vvl_alloc_total_tonne;
}

class ActBooking {
  public vvl_bkg_ops_teu;
  public vvl_bkg_slot_teu;
  public vvl_bkg_bb_rt;
  public vvl_bkg_total_tonne;
}
