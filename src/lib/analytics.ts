import ReactGA from "react-ga4";

const GA_MEASUREMENT_ID = "G-BBQ1PPGCCE";

export const initGA = () => {
  ReactGA.initialize(GA_MEASUREMENT_ID, {
    gtagUrl: "https://picsew.ibotcloud.top/ga/js",
    gtagOptions: {
      transport_url: "https://picsew.ibotcloud.top/ga/collect",
    },
  });
};

export const logPageView = (path: string) => {
  ReactGA.send({ hitType: "pageview", page: path });
};

export const logEvent = (category: string, action: string, label?: string) => {
  ReactGA.event({
    category,
    action,
    label,
  });
};
