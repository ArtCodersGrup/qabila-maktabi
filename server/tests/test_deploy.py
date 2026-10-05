# Deploy fayllari bir-biriga mos: port, xotira chegarasi, WebSocket, saytga nima chiqadi.
from pathlib import Path

D = Path(__file__).resolve().parents[1] / "deploy"
read = lambda name: (D / name).read_text(encoding="utf-8")


def test_port_bir_xil():
    assert "--port 8100" in read("kelajagim-api.service")
    assert read("nginx-kelajagim.conf").count("proxy_pass http://127.0.0.1:8100;") == 2
    assert "127.0.0.1:8100/api/salomat" in read("ornat.sh")


def test_systemd_chegaralar():
    unit = read("kelajagim-api.service")
    for qator in ("User=kelajagim", "MemoryMax=300M", "--workers 1", "EnvironmentFile=/srv/kelajagim/api.env", "NoNewPrivileges=true"):
        assert qator in unit


def test_nginx_websocket_va_server_nomi():
    conf = read("nginx-kelajagim.conf")
    assert "location /api/ws/" in conf and "proxy_set_header Upgrade $http_upgrade;" in conf
    assert "server_name kelajagim.uz;" in conf and "server_name www.kelajagim.uz;" in conf
    assert "default_server" not in conf  # boshqa saytlarning standart serverini egallamaymiz


def test_saytga_faqat_commit_chiqadi():
    sh = read("deploy.sh")
    assert "git archive HEAD" in sh
    assert "--exclude=/server/" in sh and "--exclude=/docs/" in sh
    assert "git status --porcelain" in sh
    assert "ControlMaster=auto" in sh and sh.count('-e "$SSH"') == 2  # ufw LIMIT: bitta ulanish


def test_nginx_faqat_bir_marta_va_tekshiruv_bilan():
    sh = read("ornat.sh")
    assert "if [ ! -e /etc/nginx/sites-available/kelajagim.uz ]" in sh
    assert "nginx -t" in sh
    assert "REVOKE CONNECT ON DATABASE kelajagim FROM PUBLIC" in sh


def test_maxfiy_narsa_yoq():
    for f in D.iterdir():
        matn = f.read_text(encoding="utf-8")
        assert "PASSWORD '" not in matn or "$PASS" in matn, f.name
        assert "postgresql://kelajagim:" not in matn or "%s@" in matn, f.name
