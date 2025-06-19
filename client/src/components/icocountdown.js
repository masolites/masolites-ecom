// ICO Dashboard with Token Progress
export default function ICOCountdown() {
  const [daysLeft, setDaysLeft] = useState(120);
  const [tokenPrice, setTokenPrice] = useState(0.001);
  
  useEffect(() => {
    // Calculate token price progression
    const progress = (120 - daysLeft) / 120;
    const targetPrice = 0.4 + (0.35 * progress);
    setTokenPrice(Math.min(targetPrice, 0.75));
  }, [daysLeft]);

  return (
    <div className="ico-dashboard">
      <h3>PRIVATE SALE ICO</h3>
      <CountdownTimer targetDate={new Date(launchDate + 120*86400000)} />
      <TokenProgressBar current={tokenPrice} min={0.001} max={3} />
      <div className="price-voting">
        <h4>Vote for Tomorrow's Price: ${tokenPrice.toFixed(3)}</h4>
        {user.balanceMZLx >= 100 && (
          <VotingSlider min={0.4} max={3} step={0.01} />
        )}
      </div>
    </div>
  );
