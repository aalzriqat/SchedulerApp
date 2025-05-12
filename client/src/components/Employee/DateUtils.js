export const formatTime = (dateString) => {
    const date = new Date(dateString);
    const options = {
      timeZone: "Asia/Amman",
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    };
    const formatter = new Intl.DateTimeFormat("en-GB", options);
    const [
      { value: day },
      ,
      { value: month },
      ,
      { value: year },
      ,
      { value: hours },
      ,
      { value: minutes },
      ,
      { value: seconds },
    ] = formatter.formatToParts(date);
  
    return `${day}-${month}-${year} , ${hours}:${minutes}:${seconds}`;
  };